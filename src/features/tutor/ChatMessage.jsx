import { BrandMark } from "@/components/layout/Brand";
import { tutorStyles as s } from "./style";

export function ChatMessage({ message }) {
  if (message.role === "user")
    return (
      <div className={s.user} data-testid="chat-message-user">
        <span className="sr-only">You: </span>
        {message.content}
      </div>
    );
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <BrandMark className="size-3.5" />
        <span className="text-[10px] font-medium text-muted-foreground">
          Look
        </span>
      </div>
      <div className={s.assistant} data-testid="chat-message-assistant">
        {message.content}
      </div>
    </div>
  );
}
