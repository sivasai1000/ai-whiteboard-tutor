import {
  generatedLessonSchema,
  lessonPlanSchema,
  wordCount,
} from "./lesson-schema.js";
import { checkVisualLesson } from "./visual-lesson.js";

/** Compile a provider plan into the existing, seekable playback format. */
export function compileLessonPlan(value) {
  const parsed = lessonPlanSchema.safeParse(value);
  if (!parsed.success) {
    return {
      content: null,
      issues: parsed.error.issues
        .slice(0, 12)
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  }
  const issues = [];
  const content = {
    ...parsed.data,
    scenes: parsed.data.scenes.map((scene, chapter) => {
      const ids = new Set(scene.visual.nodes.map((node) => node.id));
      return {
        ...scene,
        steps: scene.steps.map(({ nodeStates, ...step }, index) => {
          const seen = new Set();
          for (const node of nodeStates) {
            if (!ids.has(node.id) || seen.has(node.id)) {
              issues.push(
                `Chapter ${chapter + 1}, step ${index + 1}: nodeStates must reference each existing diagram node at most once.`,
              );
            }
            seen.add(node.id);
          }
          return {
            ...step,
            visible: nodeStates.map((node) => node.id),
            focus: nodeStates
              .filter((node) => node.state === "focus")
              .map((node) => node.id),
            dim: nodeStates
              .filter((node) => node.state === "dim")
              .map((node) => node.id),
          };
        }),
      };
    }),
  };
  return {
    content,
    issues: [...new Set([...issues, ...inspectLesson(content)])],
  };
}

/** Keep structural, duration and simulation checks after every provider pass. */
export function inspectLesson(content) {
  const parsed = generatedLessonSchema.safeParse(content);
  if (!parsed.success)
    return parsed.error.issues
      .slice(0, 12)
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  const words = content.scenes.reduce(
    (sum, scene) =>
      sum + wordCount(scene.steps.map((step) => step.narration).join(" ")),
    0,
  );
  const issues =
    words < 230 || words > 340
      ? [
          `Narration has ${words} words. Rewrite it to 270–310 words across eighteen steps (about 15–17 words per step).`,
        ]
      : [];
  content.scenes.forEach((scene, index) => {
    issues.push(
      ...checkVisualLesson({ scenes: [scene] }).map(
        (issue) => `Chapter ${index + 1}: ${issue}`,
      ),
    );
  });
  return issues;
}
