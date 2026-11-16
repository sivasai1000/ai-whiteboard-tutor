import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import {
  lessonRequestSchema,
  chatRequestSchema,
  checkLessonGeometry,
} from "../src/lib/lesson-schema.js";
import { signNarration, verifyNarration } from "../src/server/speech-tokens.js";
import {
  assertSameOrigin,
  handleApi,
  readJson,
} from "../src/server/request.js";
import { publicError } from "../src/server/errors.js";
import {
  consumeMemoryLimit,
  consumeMemoryLimits,
  consumeSharedLimits,
  SHARED_LIMIT_SCRIPT,
  checkRateLimit,
} from "../src/server/rate-limit.js";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function request(
  body,
  headers = {},
  url = "http://localhost:3000/api/lessons",
) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("request validation", () => {
  it("accepts the actual Host when Next reconstructs localhost and rejects unrelated origins", () => {
    expect(() =>
      assertSameOrigin(
        request(
          {},
          { Host: "127.0.0.1:3000", Origin: "http://127.0.0.1:3000" },
        ),
      ),
    ).not.toThrow();
    expect(() =>
      assertSameOrigin(
        request(
          {},
          {
            Host: "127.0.0.1:3000",
            Origin: "https://attacker.example",
            "X-Forwarded-Host": "attacker.example",
          },
        ),
      ),
    ).toThrow();
    expect(() =>
      assertSameOrigin(
        request(
          {},
          {
            Host: "127.0.0.1:3000",
            Origin: "http://127.0.0.1:3000",
            "Sec-Fetch-Site": "cross-site",
          },
        ),
      ),
    ).toThrow();
  });
  it("trims a topic and defaults the level", () => {
    expect(lessonRequestSchema.parse({ topic: "  Fractions  " })).toEqual({
      topic: "Fractions",
      level: "Beginner",
    });
  });
  it("rejects oversized topics, unknown fields and unsupported levels", () => {
    for (const value of [
      { topic: "x".repeat(241) },
      { topic: "Math", model: "expensive" },
      { topic: "Math", level: "Expert" },
    ])
      expect(lessonRequestSchema.safeParse(value).success).toBe(false);
  });
  it("requires a latest user question and bounded history", () => {
    const lesson = {
      title: "Math",
      summary: "Numbers",
      scenes: [{ title: "One", narration: "A number." }],
    };
    expect(
      chatRequestSchema.safeParse({
        lesson,
        messages: [{ role: "assistant", content: "hello" }],
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        lesson,
        messages: Array.from({ length: 13 }, () => ({
          role: "user",
          content: "Why?",
        })),
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        lesson,
        messages: [{ role: "user", content: "Why?" }],
      }).success,
    ).toBe(true);
  });
  it("rejects off-board shapes and scenes consisting only of text", () => {
    expect(
      checkLessonGeometry({
        scenes: [
          {
            title: "Test",
            elements: [
              { type: "rect", x: 900, y: 300, width: 100, height: 100 },
            ],
          },
        ],
      }),
    ).toContain("Rectangle outside board.");
    expect(
      checkLessonGeometry({
        scenes: [{ title: "Test", elements: [{ type: "text" }] }],
      }),
    ).toHaveLength(1);
  });
  it("accepts a valid line pointing left", () => {
    expect(
      checkLessonGeometry({
        scenes: [
          {
            title: "Test",
            elements: [
              { type: "arrow", x: 500, y: 300, width: -200, height: 0 },
            ],
          },
        ],
      }),
    ).toEqual([]);
  });
  it("checks both the Origin and browser fetch metadata", () => {
    expect(() =>
      assertSameOrigin(request({}, { Origin: "http://localhost:3000" })),
    ).not.toThrow();
    expect(() =>
      assertSameOrigin(request({}, { Origin: "https://attacker.example" })),
    ).toThrow(/own website/);
    expect(() =>
      assertSameOrigin(request({}, { "Sec-Fetch-Site": "cross-site" })),
    ).toThrow(/own website/);
    expect(() => assertSameOrigin(request({}, { Origin: "null" }))).toThrow(
      /unsupported origin/,
    );
  });
  it("does not allow an invalid APP_ORIGIN to bypass checks", () => {
    vi.stubEnv("APP_ORIGIN", "not-a-url");
    expect(() =>
      assertSameOrigin(request({}, { Origin: "https://attacker.example" })),
    ).toThrow();
  });
  it("rejects malformed JSON and inappropriate content types", async () => {
    await expect(readJson(request("{"))).rejects.toMatchObject({
      status: 400,
      code: "INVALID_JSON",
    });
    await expect(
      readJson(request({}, { "Content-Type": "text/plain" })),
    ).rejects.toMatchObject({ status: 415 });
  });
  it("bounds streamed bodies even without Content-Length", async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("x".repeat(512)));
        controller.close();
      },
    });
    const input = new Request("http://localhost:3000/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      duplex: "half",
    });
    await expect(readJson(input, 128)).rejects.toMatchObject({ status: 413 });
  });
});

describe("signed narration permissions", () => {
  const text = "Earth orbits the Sun once every year.";
  it("binds a valid token to the exact generated narration", () => {
    vi.stubEnv("NARRATION_SIGNING_SECRET", "test-only-long-secret");
    const token = signNarration(text, 1000);
    expect(verifyNarration(text, token, 2000)).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(() => verifyNarration("Read something else", token, 2000)).toThrow(
      /doesn't match/,
    );
  });
  it("rejects tampered signatures and extra token components", () => {
    vi.stubEnv("NARRATION_SIGNING_SECRET", "test-only-long-secret");
    const token = signNarration(text, 1000);
    const [payload, signature] = token.split(".");
    expect(() =>
      verifyNarration(text, `${payload}.${signature.slice(0, -3)}abc`, 2000),
    ).toThrow(/invalid/);
    expect(() => verifyNarration(text, `${token}.extra`, 2000)).toThrow(
      /invalid/,
    );
  });
  it("expires unprepared speech after seven days", () => {
    vi.stubEnv("NARRATION_SIGNING_SECRET", "test-only-long-secret");
    expect(() =>
      verifyNarration(text, signNarration(text, 0), 8 * 86400_000),
    ).toThrow(/expired/);
  });
});

describe("safe API behavior", () => {
  it("never calls AI without a configured key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const handler = vi.fn();
    const response = await handleApi(request({ topic: "Fractions" }), {
      schema: lessonRequestSchema,
      kind: "lessons",
      handler,
    });
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("AI_NOT_CONFIGURED");
    expect(handler).not.toHaveBeenCalled();
  });
  it("rejects malformed input before external work", async () => {
    const handler = vi.fn();
    const response = await handleApi(request({ topic: "a" }), {
      schema: lessonRequestSchema,
      kind: "lessons",
      handler,
    });
    expect(response.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();
  });
  it("does not expose raw upstream errors", () => {
    const error = publicError(new Error("secret token and database password"));
    expect(error.message).not.toContain("secret");
    expect(publicError({ status: 401 })).toMatchObject({
      status: 503,
      code: "AI_CONFIGURATION",
    });
    expect(publicError({ code: "insufficient_quota" })).toMatchObject({
      status: 503,
      code: "AI_QUOTA_EXCEEDED",
    });
  });
  it("enforces fixed-window quotas and resets expired windows", () => {
    const key = `test-${crypto.randomUUID()}`;
    consumeMemoryLimit(key, 2, 60, 1000);
    consumeMemoryLimit(key, 2, 60, 1000);
    expect(() => consumeMemoryLimit(key, 2, 60, 1000)).toThrow(/request limit/);
    expect(() => consumeMemoryLimit(key, 2, 60, 62000)).not.toThrow();
  });
  it("does not spend global quota when an exhausted visitor is rejected", () => {
    const prefix = `atomic-${crypto.randomUUID()}`;
    const rules = (visitor) => [
      [`${prefix}:global`, 3, 86400],
      [`${prefix}:ip:${visitor}`, 1, 3600],
      [`${prefix}:session:${visitor}`, 1, 3600],
    ];
    consumeMemoryLimits(rules("a"), 1000);
    for (let attempt = 0; attempt < 20; attempt++)
      expect(() => consumeMemoryLimits(rules("a"), 1000)).toThrow(
        /request limit/,
      );
    expect(() => consumeMemoryLimits(rules("b"), 1000)).not.toThrow();
    expect(() => consumeMemoryLimits(rules("c"), 1000)).not.toThrow();
    expect(() => consumeMemoryLimits(rules("d"), 1000)).toThrow(
      /request limit/,
    );
  });
  it("does not spend IP quota when a session bucket denies the request", () => {
    const prefix = `session-${crypto.randomUUID()}`;
    consumeMemoryLimits([[`${prefix}:session`, 1, 3600]], 1000);
    expect(() =>
      consumeMemoryLimits(
        [
          [`${prefix}:ip`, 1, 3600],
          [`${prefix}:session`, 1, 3600],
        ],
        1000,
      ),
    ).toThrow();
    expect(() =>
      consumeMemoryLimits([[`${prefix}:ip`, 1, 3600]], 1000),
    ).not.toThrow();
  });
  it("sends one atomic shared-limit command and maps its denied result", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    const fetch = vi
      .fn()
      .mockResolvedValue(Response.json({ result: [0, 2, 90] }));
    vi.stubGlobal("fetch", fetch);
    await expect(
      consumeSharedLimits([
        ["global", 20, 86400],
        ["ip", 4, 3600],
      ]),
    ).rejects.toMatchObject({ code: "REQUEST_LIMIT", retryAfter: 90 });
    expect(fetch).toHaveBeenCalledTimes(1);
    const command = JSON.parse(fetch.mock.calls[0][1].body);
    expect(command).toEqual([
      "EVAL",
      SHARED_LIMIT_SCRIPT,
      "2",
      "luma:{limits}:global",
      "luma:{limits}:ip",
      "20",
      "86400",
      "4",
      "3600",
    ]);
    expect(SHARED_LIMIT_SCRIPT.indexOf("return {0")).toBeLessThan(
      SHARED_LIMIT_SCRIPT.indexOf("'INCR'"),
    );
  });
  it("fails closed if the configured shared limiter is unavailable", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(
      checkRateLimit(request({}), "lessons", "test-session"),
    ).rejects.toMatchObject({ code: "LIMITER_UNAVAILABLE" });
  });
});
