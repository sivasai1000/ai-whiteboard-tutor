import { lessonRequestSchema } from "@/lib/lesson-schema";
import { handleApi } from "@/server/request";
import { generateLesson } from "@/server/lesson-service";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request) {
  return handleApi(request, {
    schema: lessonRequestSchema,
    kind: "lessons",
    timeoutMs: 170_000,
    maxBytes: 2048,
    handler: async (input, options) => ({
      lesson: await generateLesson(input, options),
    }),
  });
}
