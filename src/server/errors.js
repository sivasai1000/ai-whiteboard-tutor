export class AppError extends Error {
  constructor(code, message, status = 400, retryAfter) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function publicError(error) {
  if (error instanceof AppError) return error;
  if (error?.name === "AbortError" || error?.name === "APIUserAbortError") {
    return new AppError(
      "REQUEST_CANCELLED",
      "The request was cancelled. You can try again.",
      499,
    );
  }
  if (
    error?.name === "TimeoutError" ||
    error?.name === "APIConnectionTimeoutError"
  ) {
    return new AppError(
      "AI_TIMEOUT",
      "The tutor took too long to respond. Please try again.",
      504,
    );
  }
  if (error?.code === "insufficient_quota") {
    return new AppError(
      "AI_QUOTA_EXCEEDED",
      "The tutor's AI credit balance is unavailable. Please try again after the owner restores credits.",
      503,
    );
  }
  if (error?.status === 429 || error?.code === "rate_limit_exceeded") {
    return new AppError(
      "AI_BUSY",
      "The tutor is busy. Please wait a moment and try again.",
      429,
      30,
    );
  }
  if ([401, 403, 404].includes(error?.status)) {
    return new AppError(
      "AI_CONFIGURATION",
      "The tutor's AI connection needs attention. Please contact the app owner.",
      503,
    );
  }
  return new AppError(
    "AI_UNAVAILABLE",
    "The tutor could not complete this request. Please try again.",
    502,
  );
}
