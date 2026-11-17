"use client";

import { useEffect, useRef, useState } from "react";

/** Native fullscreen keeps the lesson mounted; expanded mode covers unsupported browsers. */
export function useLessonFullscreen() {
  const ref = useRef(null);
  const trigger = useRef(null);
  const [mode, setMode] = useState(null);
  const [error, setError] = useState("");
  const restoreFocus = () => {
    if (trigger.current?.isConnected)
      trigger.current.focus({ preventScroll: true });
  };

  useEffect(() => {
    function sync() {
      if (ref.current && document.fullscreenElement === ref.current)
        setMode("native");
      else {
        setMode((current) => (current === "native" ? null : current));
        restoreFocus();
      }
    }
    function escape(event) {
      if (
        event.key === "Escape" &&
        ref.current &&
        document.fullscreenElement === ref.current
      ) {
        document.exitFullscreen().catch(() => {});
      }
    }
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  useEffect(() => {
    if (mode !== "expanded") return;
    const element = ref.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Make every branch outside the expanded lesson inert, preserving previous values.
    const siblings = [];
    for (
      let current = element;
      current?.parentElement;
      current = current.parentElement
    ) {
      for (const sibling of current.parentElement.children) {
        if (sibling !== current && sibling instanceof HTMLElement) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      if (current.parentElement === document.body) break;
    }
    function keyboard(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMode(null);
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...element.querySelectorAll(
          "button, a[href], input, textarea, select, [tabindex]",
        ),
      ].filter(
        (item) =>
          !item.disabled && item.tabIndex >= 0 && item.getClientRects().length,
      );
      const first = focusable[0],
        last = focusable.at(-1);
      if (!first) {
        event.preventDefault();
        element.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    element.addEventListener("keydown", keyboard);
    restoreFocus();
    return () => {
      element.removeEventListener("keydown", keyboard);
      siblings.forEach(([item, previous]) => {
        item.inert = previous;
      });
      document.body.style.overflow = previousOverflow;
      restoreFocus();
    };
  }, [mode]);

  async function toggle(event) {
    setError("");
    if (mode === "expanded") {
      setMode(null);
      return;
    }
    const element = ref.current;
    if (!element) return;
    if (document.fullscreenElement === element) {
      try {
        await document.exitFullscreen();
      } catch {
        setError("Use Esc to exit fullscreen.");
      }
      return;
    }
    trigger.current = event.currentTarget;
    try {
      if (!element.requestFullscreen || !document.fullscreenEnabled)
        throw new Error("Unavailable");
      await element.requestFullscreen();
    } catch {
      if (ref.current === element && element.isConnected) setMode("expanded");
    }
  }

  return {
    ref,
    active: mode !== null,
    expanded: mode === "expanded",
    error,
    toggle,
  };
}
