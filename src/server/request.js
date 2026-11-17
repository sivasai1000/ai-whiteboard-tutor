import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getApiKey } from "./config.js";
import { AppError, publicError } from "./errors.js";
import { checkRateLimit } from "./rate-limit.js";

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site")
    throw new AppError(
      "INVALID_ORIGIN",
      "Please use the tutor from its own website.",
      403,
    );
  if (!origin) return; // Permit server-to-server clients; public API limits apply.
  let received;
  try {
    received = new URL(origin).origin;
  } catch {
    throw new AppError(
      "INVALID_ORIGIN",
      "This request came from an unsupported origin.",
      403,
    );
  }
  const requestUrl = new URL(request.url);
  const allowed = new Set([requestUrl.origin]);
  // Next.js can reconstruct a local request URL with "localhost" even when
  // the browser used 127.0.0.1. Host retains the actual HTTP request authority.
  // Never trust arbitrary X-Forwarded-Host values from the client.
  const host = request.headers.get("host");
  if (host) {
    try {
      const hostUrl = new URL(`${requestUrl.protocol}//${host}`);
      if (hostUrl.host === host.toLowerCase()) allowed.add(hostUrl.origin);
    } catch {
      /* A malformed Host never adds an allowed origin. */
    }
  }
  if (process.env.APP_ORIGIN) {
    try {
      allowed.add(new URL(process.env.APP_ORIGIN).origin);
    } catch {
      /* Invalid optional origin never opens access. */
    }
  }
  if (!allowed.has(received))
    throw new AppError(
      "INVALID_ORIGIN",
      "Please use the tutor from its own website.",
      403,
    );
}

export async function readJson(request, maxBytes = 32768) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new AppError(
      "INVALID_CONTENT_TYPE",
      "Send this request as JSON.",
      415,
    );
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new AppError(
      "REQUEST_TOO_LARGE",
      "This request is too large. Please shorten it.",
      413,
    );
  if (!request.body)
    throw new AppError("INVALID_JSON", "This request is empty.", 400);
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  let expired = false;
  const timer = setTimeout(() => {
    expired = true;
    reader.cancel().catch(() => {});
  }, 10_000);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (expired)
        throw new AppError(
          "REQUEST_TIMEOUT",
          "The request took too long to arrive.",
          408,
        );
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new AppError(
          "REQUEST_TOO_LARGE",
          "This request is too large. Please shorten it.",
          413,
        );
      }
      chunks.push(Buffer.from(value));
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new AppError(
        "INVALID_JSON",
        "This request contains invalid JSON.",
        400,
      );
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

function sessionFor(request) {
  const key = process.env.NARRATION_SIGNING_SECRET || getApiKey();
  const cookieName = "braynix-session";
  const sign = (id, namespace = "braynix") =>
    createHmac("sha256", key)
      .update(`${namespace}-session-v1:${id}`)
      .digest("base64url");
  const cookies =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim()) || [];
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const attributes = `HttpOnly; SameSite=Strict; Path=/${secure}`;
  const updates = [];
  let currentId, previousId;
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    const name = cookie.slice(0, separator);
    if (!/^[a-z][a-z0-9]{0,40}-session$/.test(name)) continue;
    const [id, mac, extra] = cookie.slice(separator + 1).split(".");
    if (!id || !/^[0-9a-f-]{36}$/.test(id) || !mac || extra !== undefined)
      continue;
    const expected = Buffer.from(sign(id, name.slice(0, -"-session".length)));
    const actual = Buffer.from(mac);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
      continue;
    if (name === cookieName) currentId = id;
    else {
      previousId ??= id;
      updates.push(`${name}=; ${attributes}; Max-Age=0`);
    }
  }
  const id = currentId || previousId || randomUUID();
  if (!currentId)
    updates.push(
      `${cookieName}=${id}.${sign(id)}; ${attributes}; Max-Age=604800`,
    );
  return { id, cookies: updates };
}

export async function handleApi(request, { schema, kind, maxBytes, handler }) {
  const requestId = randomUUID();
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Request-Id": requestId,
  });
  try {
    assertSameOrigin(request);
    const parsed = schema.safeParse(await readJson(request, maxBytes));
    if (!parsed.success)
      throw new AppError(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message || "Please check your request.",
        400,
      );
    getApiKey();
    const session = sessionFor(request);
    for (const cookie of session.cookies) headers.append("Set-Cookie", cookie);
    await checkRateLimit(request, kind, session.id);
    const result = await handler(parsed.data, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(85_000)]),
    });
    // Streaming handlers return their own Response. Preserve its SSE body and
    // content type while applying the same session and request protections.
    if (result instanceof Response) {
      for (const [key, value] of headers) {
        if (key !== "set-cookie" && !result.headers.has(key))
          result.headers.set(key, value);
      }
      for (const cookie of headers.getSetCookie())
        result.headers.append("Set-Cookie", cookie);
      return result;
    }
    return Response.json(result, { headers });
  } catch (error) {
    const safe = publicError(error);
    if (safe.retryAfter) headers.set("Retry-After", String(safe.retryAfter));
    if (safe.status >= 500)
      console.error(
        JSON.stringify({
          event: "api_error",
          requestId,
          code: safe.code,
          status: safe.status,
        }),
      );
    return Response.json(
      { error: { code: safe.code, message: safe.message } },
      { status: safe.status, headers },
    );
  }
}
