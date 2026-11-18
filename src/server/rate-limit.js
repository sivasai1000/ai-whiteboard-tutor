import "server-only";
import { createHash } from "node:crypto";
import { AppError } from "./errors.js";
import { envLimit } from "./config.js";

const stateKey = Symbol.for("braynix.rate-limits");
const counters = (globalThis[stateKey] ||= new Map());
const HOUR = 3600;
const DAY = 86400;

// Process-local fallback is suitable for local use. Configure Redis for shared
// limits across serverless instances; this is not a provider billing hard cap.
function consumeMemoryLimits(rules, now = Date.now()) {
  if (counters.size > 5000) {
    for (const [id, entry] of counters)
      if (entry.expires <= now) counters.delete(id);
    if (counters.size > 5000)
      throw new AppError(
        "TUTOR_BUSY",
        "The tutor is busy. Please try again later.",
        503,
      );
  }
  const entries = rules.map(([key, limit, windowSeconds]) => {
    const current = counters.get(key);
    const entry =
      current && current.expires > now
        ? current
        : { count: 0, expires: now + windowSeconds * 1000 };
    if (entry.count >= limit)
      throw new AppError(
        "REQUEST_LIMIT",
        "You've reached the demo's request limit. Please return later, or replay an existing lesson.",
        429,
        Math.max(1, Math.ceil((entry.expires - now) / 1000)),
      );
    return [key, entry];
  });
  // Preflight every rule before changing any counter. This synchronous section
  // cannot interleave in one JS process, so rejected visitors consume no quota.
  for (const [key, entry] of entries) {
    entry.count += 1;
    counters.set(key, entry);
  }
}

const SHARED_LIMIT_SCRIPT = `
for i, key in ipairs(KEYS) do
  local count = tonumber(redis.call('GET', key) or '0')
  if count >= tonumber(ARGV[i * 2 - 1]) then
    return {0, i, math.max(1, redis.call('TTL', key))}
  end
end
for i, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('EXPIRE', key, ARGV[i * 2]) end
end
return {1, 0, 0}
`;

async function consumeSharedLimits(rules) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url && !token) {
    consumeMemoryLimits(rules);
    return;
  }
  if (!url?.startsWith("https://") || !token)
    throw new AppError(
      "LIMITER_CONFIGURATION",
      "The tutor's request limits need configuration. Please contact the app owner.",
      503,
    );
  let result;
  try {
    const response = await fetch(url.replace(/\/$/, ""), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // One atomic Lua command across all buckets, with a common Redis hash tag.
      body: JSON.stringify([
        "EVAL",
        SHARED_LIMIT_SCRIPT,
        String(rules.length),
        ...rules.map(([key]) => `braynix:{limits}:${key}`),
        ...rules.flatMap(([, limit, window]) => [
          String(limit),
          String(window),
        ]),
      ]),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Limiter unavailable");
    const data = await response.json();
    result = data.result;
    if (
      data.error ||
      !Array.isArray(result) ||
      result.length !== 3 ||
      ![0, 1].includes(result[0])
    )
      throw new Error("Invalid limiter response");
  } catch {
    // Fail closed when shared limits were requested; never silently bypass them.
    throw new AppError(
      "LIMITER_UNAVAILABLE",
      "The tutor is temporarily unavailable. Please try again shortly.",
      503,
    );
  }
  if (result[0] === 0)
    throw new AppError(
      "REQUEST_LIMIT",
      "The demo's request limit has been reached. Please return later, or replay an existing lesson.",
      429,
      Math.max(1, Number(result[2]) || 1),
    );
}

export async function checkRateLimit(request, kind, sessionId) {
  const daily = {
    lessons: envLimit("DAILY_LESSON_LIMIT", 20),
    speech: envLimit("DAILY_SPEECH_LIMIT", 180),
    chat: envLimit("DAILY_CHAT_LIMIT", 120),
  };
  const hourly = { lessons: 4, speech: 40, chat: 30 };
  // Vercel supplies this header. Self-hosters must explicitly opt into a trusted
  // reverse proxy; otherwise all clients share one conservative IP bucket.
  const forwarded = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")
    : process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")
      : null;
  const ip = (forwarded || "shared").split(",")[0].trim();
  const identity = createHash("sha256").update(ip).digest("hex").slice(0, 24);
  await consumeSharedLimits([
    [`global:${kind}`, daily[kind], DAY],
    [`ip:${identity}:${kind}`, hourly[kind], HOUR],
    [`session:${sessionId}:${kind}`, hourly[kind], HOUR],
  ]);
}
