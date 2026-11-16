"use client";

import { useCallback, useEffect, useRef } from "react";

export function useConversationPersistence(id, messages, busy, update) {
  const latest = useRef(messages);
  const persisted = useRef(JSON.stringify(messages));
  latest.current = messages;

  const save = useCallback(() => {
    const snapshot = latest.current;
    const serialized = JSON.stringify(snapshot);
    if (!snapshot.length || serialized === persisted.current) return;
    // The provider serializes writes, so an older checkpoint cannot overwrite
    // a newer reply. Failed writes remain retryable and surface a storage error.
    persisted.current = serialized;
    update(id, snapshot).catch(() => {
      persisted.current = null;
    });
  }, [id, update]);

  useEffect(() => {
    if (!busy) return;
    // Checkpoint on a fixed interval. A debounce would never fire while tokens
    // arrive continuously, losing the entire partial answer on a refresh.
    const timer = setInterval(save, 500);
    return () => clearInterval(timer);
  }, [busy, save]);

  useEffect(() => {
    if (!busy) save();
  }, [messages, busy, save]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHidden);
      save();
    };
  }, [save]);
}
