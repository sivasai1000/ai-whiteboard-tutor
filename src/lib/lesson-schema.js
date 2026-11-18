import { z } from "zod";
import { VISUAL_SYMBOLS } from "./visual-symbols.js";

export const lessonRequestSchema = z
  .object({
    topic: z
      .string()
      .trim()
      .min(3, "Enter a topic with at least 3 characters.")
      .max(240),
    level: z.enum(["Beginner", "Intermediate"]).default("Beginner"),
    model: z.string().min(1).max(100).optional(),
    reasoningEffort: z.enum(["low", "medium", "high"]).default("low"),
  })
  .strict();

const nodeId = z.string().regex(/^[a-zA-Z0-9_-]{1,32}$/);
const nodeList = z.array(nodeId).max(8);
const visualNodeSchema = z
  .object({
    id: nodeId,
    label: z.string().min(1).max(28),
    detail: z.string().max(55),
    value: z.number().min(0).max(1e12),
    color: z.enum(["indigo", "teal", "amber", "rose"]),
    symbol: z.enum(VISUAL_SYMBOLS),
  })
  .strict();

export const generatedLessonSchema = z
  .object({
    title: z.string().min(3).max(90),
    summary: z.string().min(20).max(400),
    scenes: z
      .array(
        z
          .object({
            title: z.string().min(3).max(70),
            visual: z
              .object({
                layout: z.enum([
                  "array",
                  "flow",
                  "cycle",
                  "comparison",
                  "bars",
                  "concept",
                  "equation",
                  "moon-phases",
                ]),
                caption: z.string().min(1).max(45),
                unit: z.string().max(20),
                nodes: z.array(visualNodeSchema).min(2).max(8),
                links: z
                  .array(
                    z
                      .object({
                        from: nodeId,
                        to: nodeId,
                        label: z.string().max(22),
                      })
                      .strict(),
                  )
                  .max(8),
              })
              .strict(),
            steps: z
              .array(
                z
                  .object({
                    narration: z.string().min(15).max(180),
                    note: z.string().max(65),
                    visible: nodeList.min(1),
                    focus: nodeList,
                    dim: nodeList,
                    updates: z
                      .array(
                        z
                          .object({
                            id: nodeId,
                            label: z.string().min(1).max(28),
                            value: z.number().min(0).max(1e12),
                          })
                          .strict(),
                      )
                      .max(4),
                  })
                  .strict(),
              )
              .min(3)
              .max(5),
          })
          .strict(),
      )
      .length(6),
  })
  .strict();

// The provider chooses one state per node. The server derives the three playback
// lists, so a highlighted node can never accidentally be hidden.
const sceneSchema = generatedLessonSchema.shape.scenes.element;
const stepSchema = sceneSchema.shape.steps.element;
export const lessonPlanSchema = generatedLessonSchema.extend({
  scenes: z
    .array(
      sceneSchema.extend({
        steps: z
          .array(
            stepSchema.omit({ visible: true, focus: true, dim: true }).extend({
              nodeStates: z
                .array(
                  z
                    .object({
                      id: nodeId,
                      state: z.enum(["visible", "focus", "dim"]),
                    })
                    .strict(),
                )
                .min(1)
                .max(8),
            }),
          )
          .length(3),
      }),
    )
    .length(6),
});

export const speechRequestSchema = z
  .object({
    text: z.string().min(10).max(800),
    token: z.string().min(20).max(1000),
    segments: z.array(z.string().min(15).max(180)).min(3).max(5).optional(),
  })
  .strict();

export const chatRequestSchema = z
  .object({
    lesson: z
      .object({
        title: z.string().min(1).max(90),
        summary: z.string().max(400),
        scenes: z
          .array(
            z
              .object({
                title: z.string().max(70),
                narration: z.string().max(800),
              })
              .strict(),
          )
          .min(1)
          .max(9),
      })
      .strict(),
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(2000),
          })
          .strict(),
      )
      .min(1)
      .max(12),
  })
  .strict()
  .refine((value) => value.messages.at(-1)?.role === "user", {
    message: "Send a question to the tutor.",
    path: ["messages"],
  });

export function wordCount(text) {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}
