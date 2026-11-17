import { speechWeight } from "@/lib/word-timing";

const MAX_CHARACTERS = 64;
const MAX_WORDS = 10;
const CONNECTORS = new Set([
  "and",
  "or",
  "but",
  "a",
  "an",
  "the",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
]);

/**
 * Estimated phrase timings, scaled to the measured audio duration.
 * Legacy fallback only. New recordings carry aligned word timestamps.
 * Resolving from the audio clock keeps pauses, speed changes and seeks reversible.
 */
export function buildSubtitleCues(narration, duration) {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const words = String(narration || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const phrases = [];
  let phrase = [];
  const flush = () => {
    if (phrase.length) phrases.push(phrase);
    phrase = [];
  };
  for (const word of words) {
    if (
      phrase.length &&
      (phrase.length >= MAX_WORDS ||
        [...phrase, word].join(" ").length > MAX_CHARACTERS)
    ) {
      const carry =
        phrase.length > 2 && CONNECTORS.has(phrase.at(-1).toLowerCase())
          ? phrase.pop()
          : null;
      flush();
      if (carry) phrase.push(carry);
    }
    phrase.push(word);
    if (
      /[.!?]["'”’)]*$/.test(word) ||
      (phrase.length >= 5 && /[,;:]["'”’)]*$/.test(word))
    )
      flush();
  }
  flush();
  const weights = phrases.map((part) =>
    part.reduce((sum, word) => sum + speechWeight(word), 0),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;
  return phrases.map((part, index) => {
    const start = cursor;
    cursor += (weights[index] / total) * duration;
    return {
      text: part.join(" "),
      start,
      end: index === phrases.length - 1 ? duration : cursor,
    };
  });
}

export function resolveSubtitle(cues, time) {
  if (!cues.length) return null;
  const position = Number.isFinite(time) ? Math.max(0, time) : 0;
  return cues.find((cue) => position < cue.end) || cues.at(-1);
}
