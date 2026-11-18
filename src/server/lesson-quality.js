import { AppError } from "./errors.js";

// Diagnostics are sent back to the generator, never exposed as blame for the
// learner's topic. Only this error permits the single corrective attempt.
export class LessonQualityError extends AppError {
  constructor(issues) {
    super(
      "LESSON_QUALITY",
      "I couldn’t finish a reliable lesson this time. Please try again; your topic is still here.",
      502,
    );
    this.issues = issues;
  }
}
