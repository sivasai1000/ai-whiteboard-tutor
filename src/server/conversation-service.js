import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { getApiKey, resolveTextModel } from "./config.js";
import { publicError } from "./errors.js";

const CONVERSATION_PROMPT = `You are Look, a thoughtful, clear AI learning companion.
Help users understand ideas, work through problems, write, and explore questions.
Follow the conversation and explain with concrete examples. Ask a focused question
when needed. Be candid about uncertainty. You have no web browsing, access to the
user's saved whiteboards, or ability to run code or change files. Never claim those
actions occurred. Use readable Markdown, code fences for code, and concise sections
only when helpful. Aim for under 500 words unless the request needs more detail.
Do not identify yourself as Claude or claim a different provider.`;

// Reasoning shares the completion budget with visible text. Keep a bounded
// allowance for each selectable effort so thinking does not crowd out the answer.
const OUTPUT_BUDGET = { low: 3000, medium: 5000, high: 8000 };

export async function streamConversation(
  { messages, model, reasoningEffort = "low" },
  { signal } = {},
) {
  const configuredModel = resolveTextModel(model);
  const openai = createOpenAI({ apiKey: getApiKey() });
  const result = streamText({
    model: openai.responses(configuredModel),
    system: CONVERSATION_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: OUTPUT_BUDGET[reasoningEffort],
    maxRetries: 0,
    abortSignal: signal,
    providerOptions: { openai: { store: false, reasoningEffort } },
    // Stream errors are converted to safe user-facing messages below. Avoid the
    // SDK's default console logging of provider errors/request bodies.
    onError: () => {},
  });
  return createUIMessageStreamResponse({
    headers: {
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      sendReasoning: false,
      onError: (error) =>
        publicError({
          name: error?.name,
          status: error?.statusCode ?? error?.status,
          code: error?.code,
        }).message,
    }),
  });
}
