import { speechRequestSchema } from "@/lib/lesson-schema";
import { handleApi } from "@/server/request";
import { generateSpeech } from "@/server/speech-service";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request) {
  return handleApi(request, {
    schema: speechRequestSchema,
    kind: "speech",
    maxBytes: 4096,
    handler: generateSpeech,
  });
}
