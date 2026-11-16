"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  LoaderCircle,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useLessons } from "@/features/library/LessonProvider";
import { apiRequest } from "@/lib/api";
import { ErrorState } from "@/components/shared/ErrorState";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import { tutorStyles as s } from "./style";

const suggestions = [
  "Explain it more simply",
  "Give me an everyday example",
  "Ask me a question to check my understanding",
];

export function TutorChat({ lesson, onPause }) {
  const { updateLesson } = useLessons();
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [retryQuestion, setRetryQuestion] = useState("");
  const controller = useRef(null);
  const bottom = useRef(null);
  const messages = lesson.messages || [];

  useEffect(() => () => controller.current?.abort(), [lesson.id]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [messages.length, pending]);

  async function askQuestion(content, retry = false) {
    const trimmed = content.trim();
    if (!trimmed || pending) return;
    const requestController = new AbortController();
    controller.current = requestController;
    const previous =
      retry &&
      messages.at(-1)?.role === "user" &&
      messages.at(-1)?.content === trimmed
        ? messages.slice(0, -1)
        : messages;
    const next = [
      ...previous,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ];
    setPending(true);
    setError("");
    setQuestion("");
    setRetryQuestion(trimmed);
    onPause?.();
    try {
      await updateLesson(lesson.id, { messages: next });
      const { answer } = await apiRequest(
        "/api/chat",
        {
          lesson: {
            title: lesson.title,
            summary: lesson.summary,
            scenes: lesson.scenes.map(({ title, narration }) => ({
              title,
              narration,
            })),
          },
          messages: next
            .slice(-8)
            .map(({ role, content: text }) => ({ role, content: text })),
        },
        { signal: requestController.signal },
      );
      if (requestController.signal.aborted) return;
      await updateLesson(lesson.id, {
        messages: [
          ...next,
          { id: crypto.randomUUID(), role: "assistant", content: answer },
        ],
      });
      setRetryQuestion("");
    } catch (cause) {
      if (!requestController.signal.aborted)
        setError(
          cause.message ||
            "Your tutor couldn’t answer just now. Please try again.",
        );
    } finally {
      if (controller.current === requestController) setPending(false);
    }
  }

  return (
    <section className={s.panel} aria-label="AI tutor chat">
      <div className={s.header}>
        <div className={s.avatar}>
          <Sparkles className="size-4" />
        </div>
        <div>
          <h2 className="text-[13px] font-medium">Your AI tutor</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            A little help along the way
          </p>
        </div>
        <span className="ml-auto rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[9px] text-primary">
          AI
        </span>
      </div>
      <div
        className={s.messages}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {!messages.length && (
          <>
            <div>
              <div className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
                <MessageCircle className="size-3" />
                Let’s make it click
              </div>
              <p className="text-[13px] leading-7 text-foreground/85">
                Wondering about something in this lesson? Ask a question,
                explore an example, or take it one step further.
              </p>
            </div>
            <div className="space-y-2">
              <p className="mb-3 text-[10px] text-muted-foreground/65">
                A few places to start
              </p>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className={s.suggestion}
                  type="button"
                  disabled={pending}
                  onClick={() => askQuestion(suggestion)}
                >
                  {suggestion}
                  <ArrowUpRight className="size-3 shrink-0 opacity-50" />
                </button>
              ))}
            </div>
          </>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {pending && (
          <div
            role="status"
            className="flex items-center gap-2 text-[11px] text-muted-foreground"
          >
            <LoaderCircle className="size-3.5 animate-spin text-primary" />
            Thinking it through…
          </div>
        )}
        {error && (
          <ErrorState
            message={error}
            onRetry={() => askQuestion(retryQuestion, true)}
          />
        )}
        <div ref={bottom} />
      </div>
      <ChatComposer
        value={question}
        onChange={setQuestion}
        pending={pending}
        onSubmit={(event) => {
          event.preventDefault();
          askQuestion(question);
        }}
      />
    </section>
  );
}
