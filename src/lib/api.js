/** All client requests share one safe, human-readable error path. */
export async function apiRequest(url, body, { signal } = {}) {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      payload?.error?.message ||
        "The request could not be completed. Please try again.",
    );
    error.code = payload?.error?.code;
    error.status = response.status;
    throw error;
  }
  if (!payload)
    throw new Error(
      "The server returned an unreadable response. Please try again.",
    );
  return payload;
}
