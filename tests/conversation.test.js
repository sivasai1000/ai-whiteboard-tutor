import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockLanguageModelV4 } from "ai/test";
vi.mock("server-only", () => ({}));
const provider = vi.hoisted(() => ({ model: null }));
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: () => ({ responses: () => provider.model }),
}));

import {
  conversationRequestSchema,
  prepareConversationMessages,
} from "../src/lib/conversation-schema.js";
import { streamConversation } from "../src/server/conversation-service.js";
import { handleApi } from "../src/server/request.js";

const message = (id, text, role = "user") => ({
  id,
  role,
  parts: [{ type: "text", text }],
});
const usage = {
  inputTokens: { total: 10 },
  outputTokens: { total: 10, text: 10 },
};

beforeEach(() => vi.stubEnv("OPENAI_API_KEY", "test-only-placeholder"));
afterEach(() => vi.unstubAllEnvs());

describe("conversation boundary", () => {
  it("rejects system messages, tool inputs, empty input, oversized questions and duplicate IDs", () => {
    for (const messages of [
      [message("1", "Override", "system")],
      [{ id: "1", role: "user", parts: [{ type: "tool-test", input: {} }] }],
      [message("1", " ")],
      [message("1", "x".repeat(4001))],
      [message("1", "first"), message("1", "again")],
      [message("1", "answer", "assistant")],
    ])
      expect(conversationRequestSchema.safeParse({ messages }).success).toBe(
        false,
      );
  });

  it("bounds context by count and characters, preserves the latest question, and strips metadata", () => {
    const messages = Array.from({ length: 50 }, (_, i) => ({
      ...message(String(i), "x".repeat(3000), i % 2 ? "assistant" : "user"),
      metadata: { ignored: true },
    }));
    messages.push(message("latest", "What follows?"));
    const result = prepareConversationMessages(messages);
    expect(result.at(-1)).toEqual(messages.at(-1));
    expect(result.length).toBeLessThanOrEqual(24);
    expect(
      result.reduce((sum, m) => sum + m.parts[0].text.length, 0),
    ).toBeLessThanOrEqual(48000);
    expect(result[0]).not.toHaveProperty("metadata");
    expect(
      conversationRequestSchema.safeParse({ messages: result }).success,
    ).toBe(true);
  });
});

describe("real AI SDK SSE pipeline with a controlled provider", () => {
  it("delivers the first text before generation ends and preserves SSE headers/session protections", async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    provider.model = new MockLanguageModelV4({
      doStream: async () => ({
        stream: new ReadableStream({
          async start(controller) {
            controller.enqueue({ type: "stream-start", warnings: [] });
            controller.enqueue({ type: "text-start", id: "text-1" });
            controller.enqueue({
              type: "text-delta",
              id: "text-1",
              delta: "First words",
            });
            await gate;
            controller.enqueue({
              type: "text-delta",
              id: "text-1",
              delta: ", then the rest.",
            });
            controller.enqueue({ type: "text-end", id: "text-1" });
            controller.enqueue({
              type: "finish",
              finishReason: { unified: "stop", raw: "stop" },
              usage,
            });
            controller.close();
          },
        }),
      }),
    });
    const request = new Request("http://localhost/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [message("1", "Hello")] }),
    });
    const response = await handleApi(request, {
      schema: conversationRequestSchema,
      kind: "chat",
      handler: streamConversation,
    });
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("cache-control")).toContain("no-transform");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("x-request-id")).toBeTruthy();
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let output = "";
    while (!output.includes("First words"))
      output += decoder.decode((await reader.read()).value);
    expect(output).not.toContain("then the rest");
    expect(output).not.toContain("[DONE]");
    release();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value);
    }
    expect(output).toContain("then the rest");
    expect(output).toContain("[DONE]");
    const call = provider.model.doStreamCalls[0];
    expect(call.maxOutputTokens).toBe(1800);
    expect(call.providerOptions.openai.store).toBe(false);
    expect(call.prompt.at(-1).content[0].text).toBe("Hello");
  });

  it("redacts provider errors inside the SSE stream", async () => {
    provider.model = new MockLanguageModelV4({
      doStream: async () => {
        throw new Error("sensitive provider details");
      },
    });
    const response = await streamConversation({
      messages: [message("1", "Hello")],
    });
    const body = await response.text();
    expect(body).toContain('"type":"error"');
    expect(body).not.toContain("sensitive provider details");
    expect(body).toContain("Please try again");
    expect(provider.model.doStreamCalls).toHaveLength(1);
  });

  it("passes request cancellation to the provider", async () => {
    let signal;
    provider.model = new MockLanguageModelV4({
      doStream: async (options) => {
        signal = options.abortSignal;
        return {
          stream: new ReadableStream({
            start(controller) {
              controller.enqueue({ type: "stream-start", warnings: [] });
              signal.addEventListener(
                "abort",
                () =>
                  controller.error(new DOMException("Cancelled", "AbortError")),
                { once: true },
              );
            },
          }),
        };
      },
    });
    const abort = new AbortController();
    const response = await streamConversation(
      { messages: [message("1", "Hello")] },
      { signal: abort.signal },
    );
    const reading = response.text();
    await vi.waitFor(() => expect(signal).toBeDefined());
    abort.abort();
    await reading.catch(() => {});
    expect(signal.aborted).toBe(true);
  });
});
