import "server-only";
import { randomUUID } from "node:crypto";
import { zodTextFormat } from "openai/helpers/zod";
import { generatedLessonSchema, wordCount } from "../lib/lesson-schema.js";
import { checkVisualLesson } from "../lib/visual-lesson.js";
import { createOpenAI } from "./openai.js";
import { resolveTextModel } from "./config.js";
import { signNarration } from "./speech-tokens.js";
import { AppError } from "./errors.js";
import { LESSON_PROMPT } from "./prompts.js";
import { reviewLesson } from "./lesson-review.js";

function validateContent(content) {
  const words = content.scenes.reduce(
    (total, scene) =>
      total + wordCount(scene.steps.map((step) => step.narration).join(" ")),
    0,
  );
  const visualIssues = checkVisualLesson(content);
  if (words < 230 || words > 340 || visualIssues.length) {
    // Log only structural diagnostics, never lesson text or credentials.
    console.warn("[braynix:lesson-validation]", {
      words,
      issues: visualIssues,
    });
    throw new AppError(
      "LESSON_QUALITY",
      "The generated lesson didn't pass our length or diagram checks. Please try again with a more specific topic.",
      502,
    );
  }
}

export async function generateLesson(
  { topic, level, model, reasoningEffort = "low" },
  { signal } = {},
) {
  const configuredModel = resolveTextModel(model);
  const client = createOpenAI();
  const response = await client.responses.parse(
    {
      model: configuredModel,
      store: false,
      reasoning: { effort: reasoningEffort },
      max_output_tokens: 14_000,
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

  const draft = generatedLessonSchema.parse(response.output_parsed);
  validateContent(draft);
  const content = generatedLessonSchema.parse(
    await reviewLesson(draft, client, configuredModel, signal),
  );
  validateContent(content);

  return {
    id: randomUUID(),
    topic,
    level,
    title: content.title,
    summary: content.summary,
    createdAt: new Date().toISOString(),
    source: "ai",
    model: configuredModel,
    reasoningEffort,
    saved: false,
    messages: [],
    formatVersion: 3,
    scenes: content.scenes.map((scene, index) => {
      const narration = scene.steps.map((step) => step.narration).join(" ");
      return {
        ...scene,
        id: `scene-${index + 1}`,
        narration,
        duration: Math.round((wordCount(narration) / 145) * 60 * 10) / 10,
        speechToken: signNarration(narration),
      };
    }),
  };
}
