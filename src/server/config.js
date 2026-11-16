import "server-only";
import { AppError } from "./errors.js";

export function getModels() {
  return {
    textModel: process.env.OPENAI_TEXT_MODEL || "gpt-6-luna",
    speechModel: process.env.OPENAI_SPEECH_MODEL || "gpt-realtime-2.1-mini",
  };
}

export function getApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || key === "your-openai-api-key") {
    throw new AppError(
      "AI_NOT_CONFIGURED",
      "AI lessons aren't connected yet. The app owner needs to configure an OpenAI API key. You can still explore the sample lesson.",
      503,
    );
  }
  return key;
}

export function isAiConfigured() {
  try {
    getApiKey();
    return true;
  } catch {
    return false;
  }
}

export function envLimit(name, fallback, max = 1000) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 && value <= max
    ? value
    : fallback;
}
