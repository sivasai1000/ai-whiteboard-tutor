import { z } from "zod";

export const lessonRequestSchema = z
  .object({
    topic: z
      .string()
      .trim()
      .min(3, "Enter a topic with at least 3 characters.")
      .max(240),
    level: z.enum(["Beginner", "Intermediate"]).default("Beginner"),
  })
  .strict();

// Only data is accepted from the model: never HTML, SVG markup, or executable code.
export const elementSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{1,40}$/),
    type: z.enum(["text", "rect", "circle", "line", "arrow", "equation"]),
    x: z.number().min(24).max(936),
    y: z.number().min(24).max(516),
    width: z.number().min(-900).max(900),
    height: z.number().min(-480).max(480),
    text: z.string().max(100),
    color: z.enum(["violet", "cyan", "amber", "green", "white", "muted"]),
    appearAt: z.number().min(0).max(0.85),
    points: z.string().max(0),
  })
  .strict();

export const generatedSceneSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{1,40}$/),
    title: z.string().min(3).max(70),
    narration: z.string().min(50).max(800),
    duration: z.number().min(8).max(40),
    elements: z.array(elementSchema).min(3).max(12),
  })
  .strict();

export const generatedLessonSchema = z
  .object({
    title: z.string().min(3).max(90),
    summary: z.string().min(20).max(400),
    scenes: z.array(generatedSceneSchema).min(6).max(9),
  })
  .strict();

export const speechRequestSchema = z
  .object({
    text: z.string().min(10).max(800),
    token: z.string().min(20).max(1000),
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

export function checkLessonGeometry(lesson) {
  const problems = [];
  for (const scene of lesson.scenes) {
    if (
      !scene.elements.some((item) =>
        ["rect", "circle", "line", "arrow"].includes(item.type),
      )
    ) {
      problems.push(`${scene.title} needs an explanatory diagram.`);
    }
    for (const item of scene.elements) {
      if (["rect", "circle"].includes(item.type) && item.width <= 0)
        problems.push("Shapes need positive dimensions.");
      if (
        item.type === "rect" &&
        (item.height <= 0 ||
          item.x + item.width > 940 ||
          item.y + item.height > 520)
      )
        problems.push("Rectangle outside board.");
      if (
        item.type === "circle" &&
        (item.x - item.width / 2 < 20 ||
          item.x + item.width / 2 > 940 ||
          item.y - item.width / 2 < 20 ||
          item.y + item.width / 2 > 520)
      )
        problems.push("Circle outside board.");
      if (
        ["line", "arrow"].includes(item.type) &&
        (item.x + item.width < 20 ||
          item.x + item.width > 940 ||
          item.y + item.height < 20 ||
          item.y + item.height > 520)
      )
        problems.push("Line outside board.");
    }
  }
  return problems;
}
