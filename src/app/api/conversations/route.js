import { conversationRequestSchema } from "@/lib/conversation-schema";
import { streamConversation } from "@/server/conversation-service";
import { handleApi } from "@/server/request";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request) {
  return handleApi(request, {
    schema: conversationRequestSchema,
    kind: "chat",
    maxBytes: 220000,
    handler: streamConversation,
  });
}
