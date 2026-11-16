import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { checkRateLimit } from "../src/server/rate-limit.js";

afterEach(() => {
  vi.unstubAllEnvs();
  globalThis[Symbol.for("luma.rate-limits")]?.clear();
});

it("does not spend the shared daily allowance on requests denied by one visitor limit", async () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("DAILY_LESSON_LIMIT", "6");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  globalThis[Symbol.for("luma.rate-limits")]?.clear();
  const visitor = (ip) =>
    new Request("https://luma.example/api/lessons", {
      headers: { "x-vercel-forwarded-for": ip },
    });
  for (let index = 0; index < 4; index++)
    await checkRateLimit(visitor("192.0.2.1"), "lessons", "visitor-a");
  for (let index = 0; index < 3; index++)
    await expect(
      checkRateLimit(visitor("192.0.2.1"), "lessons", "visitor-a"),
    ).rejects.toMatchObject({ code: "REQUEST_LIMIT" });
  // Four accepted requests leave two shared slots for another visitor.
  await expect(
    checkRateLimit(visitor("192.0.2.2"), "lessons", "visitor-b"),
  ).resolves.toBeUndefined();
  await expect(
    checkRateLimit(visitor("192.0.2.2"), "lessons", "visitor-b"),
  ).resolves.toBeUndefined();
});
