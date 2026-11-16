import { lessonRequestSchema } from "@/lib/lesson-schema";
import { handleApi } from "@/server/request";
import { generateLesson } from "@/server/lesson-service";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request) {
  return handleApi(request, {
    schema: lessonRequestSchema,
    kind: "lessons",
    maxBytes: 2048,
    handler: async (input, options) => ({
      lesson: await generateLesson(input, options),
    }),
  });
}
