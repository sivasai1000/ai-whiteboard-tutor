import "server-only";
import OpenAI from "openai";
import { getApiKey } from "./config.js";

// No automatic retries: a failed generation should not silently spend more credits.
export function createOpenAI() {
  return new OpenAI({ apiKey: getApiKey(), maxRetries: 0, timeout: 75_000 });
}
