// Maintainer-only macOS utility. Bundled WAV files work on every hosting platform.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { sampleScenes } from "../src/lib/sample-lesson.js";

mkdirSync("public/sample", { recursive: true });
for (const [index, scene] of sampleScenes.entries()) {
  execFileSync("say", [
    "-v",
    "Samantha",
    "-r",
    "110",
    "-o",
    `public/sample/scene-${index + 1}.wav`,
    "--file-format=WAVE",
    "--data-format=LEI16@22050",
    scene.narration,
  ]);
  console.log(`Created sample narration ${index + 1}/${sampleScenes.length}`);
}
