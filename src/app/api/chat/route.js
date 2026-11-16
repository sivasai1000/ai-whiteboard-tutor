import { chatRequestSchema } from "@/lib/lesson-schema";
import { handleApi } from "@/server/request";
import { answerQuestion } from "@/server/chat-service";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request) {
  return handleApi(request, {
    schema: chatRequestSchema,
    kind: "chat",
    maxBytes: 32768,
    handler: async (input, options) => ({
      answer: await answerQuestion(input, options),
    }),
  });
}
