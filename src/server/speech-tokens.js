import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getApiKey } from "./config.js";
import { AppError } from "./errors.js";

function secret() {
  return process.env.NARRATION_SIGNING_SECRET || getApiKey();
}

function signature(payload, context = "braynix-narration-v1") {
  return createHmac("sha256", secret())
    .update(`${context}.${payload}`)
    .digest("base64url");
}

function textHash(text) {
  return createHash("sha256").update(text).digest("base64url");
}

export function signNarration(text, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ hash: textHash(text), expires: now + 7 * 86400_000 }),
  ).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyNarration(text, token, now = Date.now()) {
  const [payload, supplied, encodedContext, extra] = token.split(".");
  const context = encodedContext
    ? Buffer.from(encodedContext, "base64").toString("utf8")
    : "braynix-narration-v1";
  if (
    !payload ||
    !supplied ||
    encodedContext === "" ||
    extra !== undefined ||
    !/^[a-z][a-z0-9]{0,40}-narration-v1$/.test(context)
  )
    throw new AppError(
      "INVALID_NARRATION",
      "This narration request is invalid. Please generate the lesson again.",
      403,
    );
  const expected = signature(payload, context);
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right))
    throw new AppError(
      "INVALID_NARRATION",
      "This narration request is invalid. Please generate the lesson again.",
      403,
    );
  let value;
  try {
    value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new AppError(
      "INVALID_NARRATION",
      "This narration request is invalid.",
      403,
    );
  }
  if (value.hash !== textHash(text) || !Number.isFinite(value.expires))
    throw new AppError(
      "INVALID_NARRATION",
      "The narration doesn't match this lesson.",
      403,
    );
  if (value.expires < now)
    throw new AppError(
      "NARRATION_EXPIRED",
      "This lesson's unprepared audio has expired. Generate the lesson again; previously saved audio still works.",
      410,
    );
  return value.hash;
}
