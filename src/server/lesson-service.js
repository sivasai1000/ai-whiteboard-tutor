import "server-only";
import { randomUUID } from "node:crypto";
import { zodTextFormat } from "openai/helpers/zod";
import {
  generatedLessonSchema,
  checkLessonGeometry,
  wordCount,
} from "../lib/lesson-schema.js";
import { createOpenAI } from "./openai.js";
import { getModels } from "./config.js";
import { signNarration } from "./speech-tokens.js";
import { AppError } from "./errors.js";
import { LESSON_PROMPT } from "./prompts.js";

export async function generateLesson({ topic, level }, { signal } = {}) {
  const response = await createOpenAI().responses.parse(
    {
      model: getModels().textModel,
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 10_000,
      input: [
        { role: "developer", content: LESSON_PROMPT },
        { role: "user", content: JSON.stringify({ topic, level }) },
      ],
      text: {
        format: zodTextFormat(generatedLessonSchema, "whiteboard_lesson"),
      },
    },
    { signal },
  );

  if (response.status !== "completed" || !response.output_parsed) {
    const refused = response.output?.some((item) =>
      item.content?.some((part) => part.type === "refusal"),
    );
    throw new AppError(
      refused ? "TOPIC_UNSUPPORTED" : "LESSON_INCOMPLETE",
      refused
        ? "The tutor can't teach that request. Try a different educational topic."
        : "The lesson wasn't fully generated. Please try a more specific topic.",
      refused ? 422 : 502,
    );
  }

  const content = generatedLessonSchema.parse(response.output_parsed);
  const words = content.scenes.reduce(
    (total, scene) => total + wordCount(scene.narration),
    0,
  );
  if (words < 190 || words > 350 || checkLessonGeometry(content).length) {
    throw new AppError(
      "LESSON_QUALITY",
      "The generated lesson didn't pass our length or diagram checks. Please try again with a more specific topic.",
      502,
    );
  }

  return {
    id: randomUUID(),
    topic,
    level,
    title: content.title,
    summary: content.summary,
    createdAt: new Date().toISOString(),
    source: "ai",
    saved: false,
    messages: [],
    scenes: content.scenes.map((scene, index) => ({
      ...scene,
      id: `scene-${index + 1}`,
      duration: Math.round((wordCount(scene.narration) / 135) * 60 * 10) / 10,
      elements: scene.elements.map((element, elementIndex) => ({
        ...element,
        id: `element-${index + 1}-${elementIndex + 1}`,
      })),
      speechToken: signNarration(scene.narration),
    })),
  };
}
