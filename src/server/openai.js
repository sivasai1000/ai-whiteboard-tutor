import "server-only";
import OpenAI from "openai";
import { getApiKey } from "./config.js";

// Transport errors never retry. The lesson service alone permits one bounded
// correction of invalid model content.
export function createOpenAI() {
  return new OpenAI({ apiKey: getApiKey(), maxRetries: 0, timeout: 75_000 });
}
