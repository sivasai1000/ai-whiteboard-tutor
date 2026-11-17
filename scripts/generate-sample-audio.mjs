// Maintainer utility: --align-only enriches existing recordings without changing audio.
// macOS voice recording: --ai for OpenAI, or --local for offline Samantha.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  validWordTimings,
  WORD_TIMING_VERSION,
} from "../src/lib/word-timing.js";
import { sampleScenes } from "../src/lib/sample-lesson.js";
import {
  joinNarrationClips,
  pcmToWav,
  narrationSimilarity,
} from "../src/server/audio.js";

function readWavPcm(file) {
  const wav = readFileSync(file);
  let offset = 12;
  while (offset + 8 <= wav.length) {
    const size = wav.readUInt32LE(offset + 4);
    if (wav.toString("ascii", offset, offset + 4) === "data")
      return wav.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  throw new Error("Missing PCM samples");
}
const alignOnly = process.argv.includes("--align-only");
const useAi = process.argv.includes("--ai");
if (!alignOnly && !useAi && !process.argv.includes("--local"))
  throw new Error(
    "Choose --ai or --align-only (uses API credits), or --local.",
  );
const { generateRealtimeAudio } = useAi
  ? await import("../src/server/speech-service.js")
  : {};
const { addWordTimings } =
  useAi || alignOnly ? await import("../src/server/word-alignment.js") : {};
const config = useAi ? await import("../src/server/config.js") : {};
const root = fileURLToPath(new URL("..", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "braynix-phrases-"));
try {
  for (const [index, scene] of sampleScenes.entries()) {
    const output = resolve(root, "public", scene.sampleAudioUrl.slice(1));
    mkdirSync(dirname(output), { recursive: true });
    if (alignOnly) {
      const metadataPath = output.replace(/\.m4a$/, ".json");
      const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
      if (
        metadata.cues.some(
          (cue, i) => cue.text !== scene.steps[i]?.narration,
        ) ||
        metadata.cues.length !== scene.steps.length
      )
        throw new Error(
          `Chapter ${index + 1} text differs from the recording; use a new sample version.`,
        );
      if (
        metadata.wordTimingVersion === WORD_TIMING_VERSION &&
        metadata.cues.every(validWordTimings)
      ) {
        console.log(
          `Chapter ${index + 1}: existing word timings are valid; skipped.`,
        );
        continue;
      }
      const recording = {
        ...metadata,
        audio: readFileSync(output.replace(/\.m4a$/, ".wav")).toString(
          "base64",
        ),
      };
      const aligned = await addWordTimings(recording, { strict: true });
      writeFileSync(
        metadataPath,
        JSON.stringify(
          {
            ...metadata,
            cues: aligned.cues,
            wordTimingVersion: aligned.wordTimingVersion,
          },
          null,
          2,
        ) + "\n",
      );
      console.log(
        `Chapter ${index + 1}: aligned ${aligned.cues.flatMap((cue) => cue.words).length} words; audio unchanged.`,
      );
      continue;
    }
    let result;
    let wavBuffer;
    if (useAi) {
      result = await generateRealtimeAudio(scene.narration, {
        apiKey: config.getApiKey(),
        model: config.getModels().speechModel,
        voice: process.env.OPENAI_VOICE || "marin",
        segments: scene.steps.map((step) => step.narration),
      });
      const similarity = narrationSimilarity(
        scene.narration,
        result.transcript,
      );
      if (similarity < 0.97)
        throw new Error(
          `Chapter ${index + 1} transcript needs review (${similarity.toFixed(3)}). No audio was saved.`,
        );
      result = await addWordTimings(result, { strict: true });
      wavBuffer = Buffer.from(result.audio, "base64");
    } else {
      const clips = scene.steps.map((step, i) => {
        const file = join(temporary, `phrase-${i}.wav`);
        execFileSync("say", [
          "-v",
          "Samantha",
          "-r",
          "155",
          "-o",
          file,
          "--file-format=WAVE",
          "--data-format=LEI16@24000",
          step.narration,
        ]);
        return { pcm: readWavPcm(file), text: step.narration };
      });
      result = joinNarrationClips(clips);
      wavBuffer = pcmToWav(result.pcm);
    }
    const wav = output.replace(/\.m4a$/, ".wav");
    writeFileSync(wav, wavBuffer);
    execFileSync("afconvert", [
      wav,
      output,
      "-f",
      "m4af",
      "-d",
      "aac",
      "-b",
      "48000",
      "-q",
      "127",
    ]);
    writeFileSync(
      output.replace(/\.m4a$/, ".json"),
      JSON.stringify(
        {
          duration: result.duration,
          cues: result.cues,
          wordTimingVersion: result.wordTimingVersion,
          voice: useAi ? process.env.OPENAI_VOICE || "marin" : "Samantha",
          narration: useAi ? "AI-generated voice" : "Local synthetic voice",
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `Chapter ${index + 1}: ${result.duration.toFixed(2)} seconds, ${result.cues.length} measured cues`,
    );
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
