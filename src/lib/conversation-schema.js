import { z } from "zod";

export const MAX_CHAT_INPUT = 4000;
export const MAX_CONTEXT_MESSAGES = 24;
export const MAX_CONTEXT_CHARACTERS = 48000;

const textPartSchema = z
  .object({
    type: z.literal("text"),
    text: z.string().trim().min(1).max(10000),
  })
  .strict();

export const conversationRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            role: z.enum(["user", "assistant"]),
            parts: z.array(textPartSchema).length(1),
          })
          .strict(),
      )
      .min(1)
      .max(MAX_CONTEXT_MESSAGES),
  })
  .strict()
  .superRefine(({ messages }, ctx) => {
    if (messages.at(-1).role !== "user") {
      ctx.addIssue({
        code: "custom",
        message: "End your request with a user message.",
      });
    }
    if (
      messages.some(
        (m) => m.role === "user" && m.parts[0].text.length > MAX_CHAT_INPUT,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Please keep each question under 4,000 characters.",
      });
    }
    if (
      messages.reduce((sum, m) => sum + m.parts[0].text.length, 0) >
      MAX_CONTEXT_CHARACTERS
    ) {
      ctx.addIssue({
        code: "custom",
        message: "This conversation is too long. Start a new chat.",
      });
    }
    if (new Set(messages.map((m) => m.id)).size !== messages.length) {
      ctx.addIssue({ code: "custom", message: "Message IDs must be unique." });
    }
  });

export function messageText(message) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

// Send bounded text-only context. Tools, client metadata and system messages
// never cross this boundary; the server independently validates the result.
export function prepareConversationMessages(messages) {
  let size = 0;
  const selected = [];
  for (const message of messages.slice(-MAX_CONTEXT_MESSAGES).reverse()) {
    const text = messageText(message).trim();
    if (!text) continue;
    if (size + text.length > MAX_CONTEXT_CHARACTERS) break;
    selected.unshift({
      id: message.id,
      role: message.role,
      parts: [{ type: "text", text }],
    });
    size += text.length;
  }
  return selected;
}
