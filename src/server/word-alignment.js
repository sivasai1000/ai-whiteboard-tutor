import "server-only";
import { toFile } from "openai";
import { createOpenAI } from "./openai.js";
import {
  subtitleWords,
  estimateWordTimings,
  validWordTimings,
  withEstimatedWords,
  WORD_TIMING_VERSION,
} from "../lib/word-timing.js";

// Isolated adapter: whisper-1 currently supports word timestamps. See README for
// its announced retirement and the replacement contract this module requires.
const ALIGNMENT_MODEL = "whisper-1";
const atoms = (text) =>
  String(text)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/gu, "")
    .match(/[\p{L}\p{N}]+/gu) || [];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/** Keep authored spelling/punctuation; ASR supplies positions, never lesson text. */
export function alignNarrationWords(cues, recognized, duration) {
  if (
    !Array.isArray(recognized) ||
    !recognized.length ||
    recognized.length > 500 ||
    recognized.some(
      (word, i) =>
        typeof word.word !== "string" ||
        word.word.length > 150 ||
        !Number.isFinite(word.start) ||
        !Number.isFinite(word.end) ||
        word.start < 0 ||
        word.end < word.start ||
        word.end > duration + 0.25 ||
        (i > 0 && word.start < recognized[i - 1].start),
    )
  )
    throw new Error("Invalid word timestamps");

  const reference = [];
  const groups = cues.map((cue, cueIndex) =>
    subtitleWords(cue.text).map((text) => {
      const group = { text, cueIndex, atoms: atoms(text), matches: [] };
      for (const value of group.atoms) reference.push({ value, group });
      return group;
    }),
  );
  const observed = recognized.flatMap((word) =>
    atoms(word.word).map((value) => ({
      value,
      start: word.start,
      end: word.end,
    })),
  );
  if (!reference.length || observed.length > 1000)
    throw new Error("Invalid transcript size");
  const matches = (a, b) => {
    const cue = cues[a.group.cueIndex];
    return (
      a.value === b.value &&
      b.start < cue.end + 0.15 &&
      b.end > cue.start - 0.15
    );
  };
  const rows = Array.from(
    { length: reference.length + 1 },
    () => new Uint16Array(observed.length + 1),
  );
  for (let i = reference.length - 1; i >= 0; i--) {
    for (let j = observed.length - 1; j >= 0; j--) {
      rows[i][j] = matches(reference[i], observed[j])
        ? rows[i + 1][j + 1] + 1
        : Math.max(rows[i + 1][j], rows[i][j + 1]);
    }
  }
  if (rows[0][0] / reference.length < 0.85)
    throw new Error("Transcript does not match narration");
  let i = 0,
    j = 0;
  while (i < reference.length && j < observed.length) {
    if (matches(reference[i], observed[j])) {
      reference[i].group.matches.push(observed[j]);
      i++;
      j++;
    } else if (rows[i + 1][j] >= rows[i][j + 1]) i++;
    else j++;
  }
  return cues.map((cue, cueIndex) => {
    const words = groups[cueIndex].map((group) => {
      if (group.matches.length !== group.atoms.length || !group.matches.length)
        return null;
      return {
        text: group.text,
        start: clamp(group.matches[0].start, cue.start, cue.end),
        end: clamp(group.matches.at(-1).end, cue.start, cue.end),
        source: "aligned",
      };
    });
    if (words.filter(Boolean).length / words.length < 0.75)
      throw new Error("Phrase has too few word anchors");
    // Small unmatched spans (e.g. 29.5 vs twenty-nine-and-a-half) stay between
    // adjacent audio anchors and are explicitly marked as estimates.
    for (let index = 0; index < words.length;) {
      if (words[index]) {
        index++;
        continue;
      }
      const first = index;
      while (index < words.length && !words[index]) index++;
      const previous = words[first - 1];
      const next = words[index];
      const end = next?.start ?? cue.end;
      const start = Math.min(end, previous?.end ?? cue.start);
      const estimated = estimateWordTimings({
        text: groups[cueIndex]
          .slice(first, index)
          .map((word) => word.text)
          .join(" "),
        start,
        end,
      });
      words.splice(first, estimated.length, ...estimated);
    }
    const result = { ...cue, words };
    if (!validWordTimings(result))
      throw new Error("Inconsistent word alignment");
    return result;
  });
}

export async function addWordTimings(
  recording,
  { signal, client, strict = false } = {},
) {
  try {
    const api = client || createOpenAI();
    const transcript = await api.audio.transcriptions.create(
      {
        model: ALIGNMENT_MODEL,
        file: await toFile(
          Buffer.from(recording.audio, "base64"),
          "narration.wav",
          { type: "audio/wav" },
        ),
        language: "en",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
        temperature: 0,
        prompt: recording.cues.map((cue) => cue.text).join(" "),
      },
      { signal, timeout: 18_000, maxRetries: 0 },
    );
    return {
      ...recording,
      cues: alignNarrationWords(
        recording.cues,
        transcript.words,
        recording.duration,
      ),
      wordTimingVersion: WORD_TIMING_VERSION,
    };
  } catch (error) {
    signal?.throwIfAborted();
    if (strict) throw error;
    // Alignment must never discard a good recording or trigger paid voice retries.
    console.warn("[braynix:word-timing]", { status: "estimated-fallback" });
    return {
      ...recording,
      cues: withEstimatedWords(recording.cues),
      wordTimingVersion: WORD_TIMING_VERSION,
    };
  }
}
