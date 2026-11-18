import "server-only";
import { randomUUID } from "node:crypto";
import { zodTextFormat } from "openai/helpers/zod";
import { lessonPlanSchema, wordCount } from "../lib/lesson-schema.js";
import { compileLessonPlan, inspectLesson } from "../lib/lesson-plan.js";
import { createOpenAI } from "./openai.js";
import { resolveTextModel } from "./config.js";
import { signNarration } from "./speech-tokens.js";
import { AppError } from "./errors.js";
import { LessonQualityError } from "./lesson-quality.js";
import { LESSON_PROMPT } from "./prompts.js";
import { reviewLesson } from "./lesson-review.js";

/** At most two plans. Provider failures and refusals never trigger paid retries. */
async function createReviewedLesson(client, input, { signal } = {}) {
  let previousPlan = null;
  let issues = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    signal?.throwIfAborted();
    let stage = "planning";
    try {
      const request = { topic: input.topic, level: input.level };
      if (attempt) {
        request.correction = {
          instruction:
            "Repair the listed issues in this lesson plan. Return the complete corrected plan in the same schema. Preserve correct teaching content; do not bypass a check or replace the requested topic.",
          issues,
          previousPlan,
        };
      }
      const response = await client.responses.parse(
        {
          model: input.model,
          store: false,
          reasoning: { effort: input.reasoningEffort || "low" },
          max_output_tokens: 14_000,
          input: [
            { role: "developer", content: LESSON_PROMPT },
            { role: "user", content: JSON.stringify(request) },
          ],
          text: {
            format: zodTextFormat(lessonPlanSchema, "whiteboard_lesson_plan"),
          },
        },
        { signal },
      );
      const refused = response.output?.some((item) =>
        item.content?.some((part) => part.type === "refusal"),
      );
      if (refused)
        throw new AppError(
          "TOPIC_UNSUPPORTED",
          "The tutor can’t teach that request. Try a different educational topic.",
          422,
        );
      if (response.status !== "completed" || !response.output_parsed) {
        throw new LessonQualityError([
          "The lesson plan was incomplete. Use exactly six short chapters with three steps each and concise diagrams.",
        ]);
      }
      previousPlan = response.output_parsed;
      stage = "structure";
      const compiled = compileLessonPlan(previousPlan);
      if (compiled.issues.length) throw new LessonQualityError(compiled.issues);
      stage = "accuracy";
      const content = await reviewLesson(
        compiled.content,
        client,
        input.model,
        signal,
      );
      const remaining = inspectLesson(content);
      if (remaining.length) throw new LessonQualityError(remaining);
      return content;
    } catch (cause) {
      signal?.throwIfAborted();
      // Malformed structured responses can be repaired, but billing, network,
      // authentication and cancellation errors must propagate immediately.
      const error =
        cause?.name === "ZodError" || cause instanceof SyntaxError
          ? new LessonQualityError([
              "The provider response did not match the required lesson structure. Return every required field with valid values.",
            ])
          : cause;
      if (!(error instanceof LessonQualityError)) throw error;
      console.warn("[braynix:lesson-quality]", {
        attempt: attempt + 1,
        repairing: attempt === 0,
        stage,
        issueCount: error.issues.length,
      });
      if (attempt === 1) throw error;
      issues = error.issues;
    }
  }
}

export async function generateLesson(
  { topic, level, model, reasoningEffort = "low" },
  { signal } = {},
) {
  const configuredModel = resolveTextModel(model);
  const content = await createReviewedLesson(
    createOpenAI(),
    {
      topic,
      level,
      model: configuredModel,
      reasoningEffort,
    },
    { signal },
  );
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
