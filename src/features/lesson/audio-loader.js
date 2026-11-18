import { apiRequest } from "@/lib/api";
import {
  WORD_TIMING_VERSION,
  validWordTimings,
  estimateWordTimings,
} from "@/lib/word-timing";

function audioFromBase64(base64, mimeType) {
  const bytes = Uint8Array.from(atob(base64), (character) =>
    character.charCodeAt(0),
  );
  return new Blob([bytes], { type: mimeType });
}

function measureAudio(blob, signal) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const media = new Audio();
    let settled = false;
    const finish = (error, duration) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      media.onloadedmetadata = null;
      media.onerror = null;
      signal.removeEventListener("abort", onAbort);
      media.pause();
      media.removeAttribute("src");
      media.load();
      URL.revokeObjectURL(url);
      if (error) reject(error);
      else resolve(duration);
    };
    const onAbort = () => finish(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(
      () =>
        finish(new Error("This audio could not be loaded. Please try again.")),
      15000,
    );
    media.onloadedmetadata = () => {
      const duration = media.duration;
      finish(
        Number.isFinite(duration) && duration > 0
          ? null
          : new Error("The narration has an invalid duration."),
        duration,
      );
    };
    media.onerror = () =>
      finish(new Error("This browser could not read the narration audio."));
    signal.addEventListener("abort", onAbort, { once: true });
    media.preload = "metadata";
    media.src = url;
    if (signal.aborted) onAbort();
  });
}

async function loadSampleAudio(scene, signal) {
  const urls = [scene.sampleAudioUrl];
  // Keep the original WAV as a fallback for browsers without AAC playback.
  if (scene.sampleAudioUrl.endsWith(".m4a"))
    urls.push(scene.sampleAudioUrl.replace(/\.m4a$/, ".wav"));
  let failure;
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok)
        throw new Error(
          "The sample narration is unavailable. Please reload the page.",
        );
      const blob = await response.blob();
      return { blob, duration: await measureAudio(blob, signal) };
    } catch (error) {
      signal.throwIfAborted();
      failure = error;
    }
  }
  throw failure;
}

function validCues(recording, steps) {
  const cues = recording?.cues;
  return (
    Array.isArray(cues) &&
    cues.length === steps.length &&
    cues.every(
      (cue, i) =>
        Number.isFinite(cue.start) &&
        Number.isFinite(cue.end) &&
        cue.start >= 0 &&
        cue.end > cue.start &&
        (i ? Math.abs(cue.start - cues[i - 1].end) < 0.05 : cue.start < 0.05) &&
        cue.text === steps[i].narration,
    ) &&
    Math.abs(cues.at(-1).end - recording.duration) < 0.5
  );
}

/** A cue table is not proof that its cached Blob is still readable. */
async function validateRecording(recording, scene, signal) {
  if (!(recording?.blob instanceof Blob) || recording.blob.size < 44)
    throw new Error("The saved audio is incomplete.");
  const duration = await measureAudio(recording.blob, signal);
  const checked = { ...recording, duration };
  if (scene.steps && !validCues(checked, scene.steps))
    throw new Error("The narration timing is incomplete. Please retry.");
  return checked;
}

/** Recover one invalid chapter; preserve every other paid recording. */
export async function loadChapterAudio({
  lesson,
  scene,
  getAudio,
  saveAudio,
  signal,
  ignoreCache = false,
}) {
  signal.throwIfAborted();
  let stored = ignoreCache ? null : await getAudio(lesson.id, scene.id);
  let changed = false;
  if (stored) {
    try {
      stored = await validateRecording(stored, scene, signal);
    } catch {
      signal.throwIfAborted();
      stored = null;
    }
  }
  if (!stored) {
    changed = true;
    if (lesson.source === "sample") {
      stored = await loadSampleAudio(scene, signal);
      if (scene.sampleCuesUrl) {
        const response = await fetch(scene.sampleCuesUrl, { signal });
        if (!response.ok)
          throw new Error(
            "The sample timing could not be loaded. Please retry.",
          );
        const metadata = await response.json();
        Object.assign(stored, {
          cues: metadata.cues,
          wordTimingVersion: metadata.wordTimingVersion,
          sampleWordTimingVersion: WORD_TIMING_VERSION,
        });
      }
    } else {
      const payload = await apiRequest(
        "/api/speech",
        {
          text: scene.narration,
          token: scene.speechToken,
          segments: scene.steps?.map((step) => step.narration),
        },
        { signal },
      );
      stored = {
        blob: audioFromBase64(payload.audio, payload.mimeType),
        cues: payload.cues,
        wordTimingVersion: payload.wordTimingVersion,
      };
      stored = await validateRecording(stored, scene, signal);
    }
    if (scene.steps && !validCues(stored, scene.steps))
      throw new Error("The narration timing is incomplete. Please retry.");
  } else if (
    lesson.source === "sample" &&
    scene.steps &&
    scene.sampleCuesUrl &&
    stored.sampleWordTimingVersion !== WORD_TIMING_VERSION
  ) {
    try {
      const response = await fetch(scene.sampleCuesUrl, {
        signal,
        cache: "no-store",
      });
      if (response.ok) {
        const metadata = await response.json();
        const updated = {
          ...stored,
          cues: metadata.cues,
          sampleWordTimingVersion: WORD_TIMING_VERSION,
        };
        if (validCues(updated, scene.steps)) {
          stored = updated;
          changed = true;
        }
      }
    } catch {
      signal.throwIfAborted(); // Cached playback still works offline.
    }
  }
  if (
    scene.steps &&
    (stored.wordTimingVersion !== WORD_TIMING_VERSION ||
      !stored.cues.every(validWordTimings))
  ) {
    stored = {
      ...stored,
      cues: stored.cues.map((cue) =>
        validWordTimings(cue)
          ? cue
          : { ...cue, words: estimateWordTimings(cue) },
      ),
      wordTimingVersion: WORD_TIMING_VERSION,
    };
    changed = true;
  }
  signal.throwIfAborted();
  if (changed) await saveAudio(lesson.id, scene.id, stored);
  signal.throwIfAborted();
  return stored;
}
