"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatWelcome } from "./ChatWelcome";
import { NewChatLink } from "./NewChatLink";
import { useConversations } from "./ConversationProvider";
import { useConversationChat } from "./useConversationChat";
import { aiStyles as s } from "./style";

function ChatSession({ conversation }) {
  const chat = useConversationChat(conversation);
  const hasMessages = chat.messages.length > 0;
  const error = chat.storageError || chat.error?.message;
  const composer = (
    <ChatComposer
      value={chat.input}
      onChange={chat.setInput}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      preparing={chat.preparing}
      disabled={Boolean(chat.storageError) || chat.limitReached}
    />
  );

  return (
    <section className={s.workspace} aria-label="AI chat workspace">
      <ChatHeader
        title={conversation.title}
        hasMessages={hasMessages}
        onDelete={chat.deleteChat}
      />
      {hasMessages ? (
        <>
          <h1 className="sr-only">{conversation.title}</h1>
          <ChatMessages
            messages={chat.messages}
            busy={chat.busy}
            status={chat.status}
            onRetry={chat.retry}
          />
        </>
      ) : (
        <ChatWelcome
          disabled={chat.busy || Boolean(chat.storageError)}
          onSuggestion={(prompt) => {
            chat.setInput(prompt);
            document.getElementById("ai-chat-input")?.focus();
          }}
        >
          {composer}
        </ChatWelcome>
      )}
      {error && (
        <div role="alert" className={s.alert}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          {chat.error && !chat.storageError && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto shrink-0 px-2 py-0 text-xs"
              disabled={chat.busy}
              onClick={chat.retry}
            >
              Try again
            </Button>
          )}
        </div>
      )}
      {chat.notice && !error && (
        <p
          role="status"
          className="mx-auto w-full max-w-3xl px-5 pt-2 text-xs text-muted-foreground sm:px-8"
        >
          {chat.notice}
        </p>
      )}
      {hasMessages && (
        <div className={s.composerDock}>
          {chat.limitReached && (
            <p className="mb-3 text-xs text-muted-foreground">
              This chat has reached 80 messages.{" "}
              <NewChatLink className="text-primary underline">
                Start a new chat
              </NewChatLink>{" "}
              to keep exploring.
            </p>
          )}
          {composer}
          <p className={s.footer}>
            AI can make mistakes. Check important details. · Saved on this
            device
          </p>
        </div>
      )}
      {!hasMessages && (
        <footer className="flex shrink-0 items-center justify-center border-t border-border/40 px-5 py-4 text-[11px] text-muted-foreground">
          <Link href="/" className="flex items-center gap-2 hover:text-primary">
            Prefer to see it explained? Start a whiteboard lesson{" "}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </footer>
      )}
    </section>
  );
}

export function AiWorkspace() {
  const params = useSearchParams();
  const selected = params.get("chat");
  const newKey = params.get("new");
  const [initialId] = useState(() => crypto.randomUUID());
  const { conversations, ready } = useConversations();
  const draft = useMemo(
    () => ({
      id: newKey || initialId,
      title: "New conversation",
      messages: [],
      updatedAt: new Date().toISOString(),
    }),
    [newKey, initialId],
  );
  const conversation = selected
    ? conversations.find((item) => item.id === selected)
    : draft;

  if (!ready)
    return (
      <div className="p-8 text-sm text-muted-foreground" role="status">
        Opening your conversations…
      </div>
    );
  if (!conversation)
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-xl">This conversation isn’t on this device.</h1>
        <p className="text-sm text-muted-foreground">
          Your chats are saved in the browser where you started them.
        </p>
        <Button asChild>
          <NewChatLink>Start a new chat</NewChatLink>
        </Button>
      </div>
    );
  return <ChatSession key={conversation.id} conversation={conversation} />;
}
