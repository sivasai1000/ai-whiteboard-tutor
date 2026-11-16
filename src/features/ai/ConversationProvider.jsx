"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  readConversations,
  removeConversation,
  writeConversation,
} from "@/lib/conversation-storage";

const ConversationContext = createContext(null);
const STORAGE_ERROR =
  "Your chats could not be saved on this device. Check your browser storage and reload before continuing.";

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const records = useRef([]);
  const queue = useRef(Promise.resolve());

  const publish = useCallback((next) => {
    records.current = next.sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    setConversations([...records.current]);
  }, []);

  useEffect(() => {
    let active = true;
    readConversations()
      .then((items) => {
        if (active) publish(items);
      })
      .catch(() => {
        if (active) setStorageError(STORAGE_ERROR);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [publish]);

  const mutate = useCallback((operation) => {
    const result = queue.current.then(operation);
    queue.current = result.catch(() => {});
    return result.catch((error) => {
      setStorageError(
        error.message === "CHAT_LIMIT"
          ? "You have 40 chats. Delete an older conversation to start another."
          : STORAGE_ERROR,
      );
      throw error;
    });
  }, []);

  const create = useCallback(
    (conversation) =>
      mutate(async () => {
        if (records.current.some((item) => item.id === conversation.id)) return;
        if (records.current.length >= 40) throw new Error("CHAT_LIMIT");
        await writeConversation(conversation);
        publish([conversation, ...records.current]);
        setStorageError("");
      }),
    [mutate, publish],
  );

  const update = useCallback(
    (id, messages) =>
      mutate(async () => {
        const existing = records.current.find((item) => item.id === id);
        // A late stream flush must never resurrect a deleted conversation.
        if (!existing) return;
        const next = {
          ...existing,
          messages,
          updatedAt: new Date().toISOString(),
        };
        await writeConversation(next);
        publish(records.current.map((item) => (item.id === id ? next : item)));
        setStorageError("");
      }),
    [mutate, publish],
  );

  const remove = useCallback(
    (id) =>
      mutate(async () => {
        await removeConversation(id);
        publish(records.current.filter((item) => item.id !== id));
        setStorageError("");
      }),
    [mutate, publish],
  );

  const value = useMemo(
    () => ({ conversations, ready, storageError, create, update, remove }),
    [conversations, ready, storageError, create, update, remove],
  );
  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  return useContext(ConversationContext);
}
