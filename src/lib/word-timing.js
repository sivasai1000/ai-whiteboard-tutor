/** Word times are relative to the chapter's audio, just like phrase cues. */
export const WORD_TIMING_VERSION = 1;
export const subtitleWords = (text) =>
  String(text || "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean);

export function speechWeight(word) {
  const letters = word.replace(/[^\p{L}\p{N}]/gu, "").length;
  const pause = /[.!?]["'”’)]*$/.test(word)
    ? 2
    : /[,;:]["'”’)]*$/.test(word)
      ? 1
      : 0;
  return Math.max(1, Math.sqrt(letters)) + pause;
}

/** Explicit fallback for old recordings or an unavailable alignment provider. */
export function estimateWordTimings(cue) {
  const words = subtitleWords(cue.text);
  const weights = words.map(speechWeight);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = cue.start;
  return words.map((text, index) => {
    const start = cursor;
    cursor += (weights[index] / total) * (cue.end - cue.start);
    return {
      text,
      start,
      end: index === words.length - 1 ? cue.end : cursor,
      source: "estimated",
    };
  });
}

export function validWordTimings(cue) {
  const expected = subtitleWords(cue?.text);
  return (
    expected.length > 0 &&
    Array.isArray(cue?.words) &&
    cue.words.length === expected.length &&
    cue.words.every(
      (word, index) =>
        word &&
        word.text === expected[index] &&
        Number.isFinite(word.start) &&
        Number.isFinite(word.end) &&
        word.start >= cue.start - 0.001 &&
        word.end <= cue.end + 0.001 &&
        word.end >= word.start &&
        (index === 0 || word.start >= cue.words[index - 1].start) &&
        ["aligned", "estimated"].includes(word.source),
    )
  );
}

export function withEstimatedWords(cues) {
  return cues.map((cue) => ({ ...cue, words: estimateWordTimings(cue) }));
}

/** A pure audio-clock lookup: no typewriter timer, incremental state or future words. */
export function revealedSubtitle(words, time) {
  if (!Number.isFinite(time)) return "";
  let count = 0;
  while (count < words.length && words[count].start <= time) count++;
  return words
    .slice(0, count)
    .map((word) => word.text)
    .join(" ");
}
