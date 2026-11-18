"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatWelcome } from "./ChatWelcome";
import { NewChatLink } from "./NewChatLink";
import { useConversations } from "./ConversationProvider";
import { useConversationChat } from "./useConversationChat";
import { ConversationLibrary } from "./ConversationLibrary";
import { aiStyles as s } from "./style";

function ChatSession({ conversation, model }) {
  const chat = useConversationChat(conversation, model);
  const { setSaved } = useConversations();
  const [bookmarkPending, setBookmarkPending] = useState(false);
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
      model={model}
      effort={chat.reasoningEffort}
      onEffortChange={chat.setReasoningEffort}
    />
  );

  return (
    <section className={s.workspace} aria-label="AI chat workspace">
      <ChatHeader
        title={conversation.title}
        hasMessages={hasMessages}
        onDelete={chat.deleteChat}
        saved={Boolean(conversation.saved)}
        bookmarkPending={bookmarkPending}
        onBookmark={async () => {
          setBookmarkPending(true);
          try {
            await setSaved(conversation.id, !conversation.saved);
          } catch {
            /* Provider exposes the storage error beside the composer. */
          } finally {
            setBookmarkPending(false);
          }
        }}
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
        <ChatWelcome>{composer}</ChatWelcome>
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
            AI can make mistakes. Check important details.
          </p>
        </div>
      )}
    </section>
  );
}

export function AiWorkspace({ model }) {
  const params = useSearchParams();
  const selected = params.get("chat");
  const newKey = params.get("new");
  const view = params.get("view");
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

  if (view === "history" || view === "saved")
    return <ConversationLibrary key={view} savedOnly={view === "saved"} />;
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
  return (
    <ChatSession
      key={conversation.id}
      conversation={conversation}
      model={model}
    />
  );
}
