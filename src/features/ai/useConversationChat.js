"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { prepareConversationMessages } from "@/lib/conversation-schema";
import { useConversations } from "./ConversationProvider";
import { useConversationPersistence } from "./useConversationPersistence";

const transport = new DefaultChatTransport({
  api: "/api/conversations",
  prepareSendMessagesRequest: ({ messages, body }) => ({
    body: {
      messages: prepareConversationMessages(messages),
      model: body.model,
      reasoningEffort: body.reasoningEffort,
    },
  }),
  fetch: async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(
        data?.error?.message || "The connection failed. Please try again.",
      );
    }
    return response;
  },
});

export function useConversationChat(conversation, model) {
  const { create, update, remove, storageError } = useConversations();
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [reasoningEffort, setReasoningEffort] = useState("low");
  const sending = useRef(false);
  const mounted = useRef(true);

  const chat = useChat({
    id: conversation.id,
    messages: conversation.messages,
    transport,
    throttle: 50,
    onFinish: ({ isAbort, isDisconnect, isError, finishReason }) => {
      if (isAbort)
        setNotice("Response stopped. You can retry or send another message.");
      else if (isDisconnect || isError)
        setNotice(
          "The response was interrupted. Try again to get a complete answer.",
        );
      else if (finishReason === "length")
        setNotice(
          "The answer reached its length limit. Ask Look to continue if you need more detail.",
        );
    },
  });
  const { messages, status, error, sendMessage, stop, regenerate, clearError } =
    chat;
  const busy = saving || status === "submitted" || status === "streaming";
  useConversationPersistence(conversation.id, messages, busy, update);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [conversation.id, stop]);

  async function send(text) {
    if (busy || sending.current || storageError || messages.length >= 80)
      return;
    sending.current = true;
    setSaving(true);
    setNotice("");
    clearError();
    const message = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    try {
      // Persist the question before making a paid request. The active chat keeps
      // the same ID when its URL changes, so navigation never restarts a stream.
      await create({
        ...conversation,
        title: text.replace(/\s+/g, " ").slice(0, 72),
        messages: [message],
      });
      await update(conversation.id, [...messages, message]);
      if (!mounted.current) return;
      // This is a same-page query change. Native history updates synchronously
      // and integrates with Next's useSearchParams without waiting for an RSC
      // navigation that a fast stream could delay until after a page refresh.
      window.history.replaceState(null, "", `/ai?chat=${conversation.id}`);
      setInput("");
      void sendMessage(message, { body: { model, reasoningEffort } });
    } catch {
      // The provider exposes storage errors beside the composer.
    } finally {
      sending.current = false;
      setSaving(false);
    }
  }

  function retry() {
    if (busy || storageError) return;
    setNotice("");
    clearError();
    void regenerate({ body: { model, reasoningEffort } });
  }

  async function deleteChat() {
    stop();
    try {
      await remove(conversation.id);
      window.history.replaceState(null, "", `/ai?new=${crypto.randomUUID()}`);
    } catch {
      /* Storage error is visible in the workspace. */
    }
  }

  return {
    messages,
    status,
    error,
    stop,
    busy,
    preparing: saving,
    input,
    setInput,
    reasoningEffort,
    setReasoningEffort,
    send,
    retry,
    deleteChat,
    notice,
    storageError,
    limitReached: messages.length >= 80,
  };
}
