"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock3, Sparkles } from "lucide-react";
import { useLessons } from "@/features/library/LessonProvider";
import { apiRequest } from "@/lib/api";
import { createSampleLesson } from "@/lib/sample-lesson";
import { ErrorState } from "@/components/shared/ErrorState";
import { TopicInput } from "./TopicInput";
import { BrandMark } from "@/components/layout/Brand";
import { SamplePreview } from "./SamplePreview";
import { welcomeStyles as s } from "./style";

export function WelcomeScreen({ initialTopic = "", model }) {
  const router = useRouter();
  const { saveLesson, ready, storageError, lessons } = useLessons();
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState("Beginner");
  const [reasoningEffort, setReasoningEffort] = useState("low");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef(null);
  const previewId = useRef(null);
  const previewOpening = useRef(false);
  const [openingSample, setOpeningSample] = useState(false);
  const [navigating, startNavigation] = useTransition();
  const previewBusy = openingSample || navigating;
  const libraryFull = lessons.length >= 30;
  const unavailable = !ready || Boolean(storageError) || libraryFull;
  useEffect(() => () => controller.current?.abort(), []);

  async function generateLesson(event) {
    event.preventDefault();
    if (pending || previewBusy || unavailable || topic.trim().length < 3)
      return;
    const requestController = new AbortController();
    controller.current = requestController;
    setPending(true);
    setError("");
    try {
      const { lesson } = await apiRequest(
        "/api/lessons",
        { topic: topic.trim(), level, model, reasoningEffort },
        { signal: requestController.signal },
      );
      if (requestController.signal.aborted) return;
      await saveLesson(lesson);
      router.push(`/lesson/${lesson.id}`);
    } catch (cause) {
      if (!requestController.signal.aborted)
        setError(
          cause.message || "We couldn’t create that lesson. Please try again.",
        );
    } finally {
      if (controller.current === requestController) setPending(false);
    }
  }

  function prepareSample() {
    if (unavailable || pending) return;
    previewId.current ??= crypto.randomUUID();
    router.prefetch(`/lesson/${previewId.current}`);
  }

  async function openSample() {
    if (unavailable || pending || previewOpening.current || navigating) return;
    previewOpening.current = true;
    setOpeningSample(true);
    setError("");
    try {
      const lesson = createSampleLesson();
      lesson.id = previewId.current || lesson.id;
      await saveLesson(lesson);
      startNavigation(() => router.push(`/lesson/${lesson.id}`));
    } catch (cause) {
      setError(cause.message || "The preview couldn’t be opened.");
    } finally {
      previewOpening.current = false;
      setOpeningSample(false);
    }
  }

  return (
    <div className={s.screen}>
      <div className={s.topbar}>
        <p className="text-sm font-medium">Whiteboard</p>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" />
          About 2 minutes
        </span>
      </div>
      <section className={s.content} aria-labelledby="welcome-heading">
        <BrandMark className="mb-5 size-8 text-primary sm:size-9" />
        <h1 id="welcome-heading" className={s.heading}>
          Make sense of something new.
        </h1>
        <p className={s.intro}>
          Your topic, explained with drawings and voice.
        </p>
        <TopicInput
          topic={topic}
          onTopicChange={setTopic}
          level={level}
          onLevelChange={setLevel}
          model={model}
          effort={reasoningEffort}
          onEffortChange={setReasoningEffort}
          pending={pending}
          disabled={unavailable || previewBusy}
          onSubmit={generateLesson}
          onCancel={() => {
            controller.current?.abort();
            setPending(false);
          }}
        />
        {libraryFull && (
          <p role="status" className="mt-4 text-xs text-muted-foreground">
            Your library holds 30 lessons.{" "}
            <Link
              href="/history"
              className="text-primary underline underline-offset-4"
            >
              Remove an older lesson
            </Link>{" "}
            to make room for a new one.
          </p>
        )}
        {pending && (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            Writing and checking your lesson. Most lessons take about a minute;
            a correction can take a little longer.
          </p>
        )}
        {error && (
          <div className="mt-4 w-full text-left">
            <ErrorState message={error} />
          </div>
        )}
        <SamplePreview
          onOpen={openSample}
          onPrepare={prepareSample}
          opening={previewBusy}
          disabled={unavailable || pending || previewBusy}
        />
      </section>
    </div>
  );
}
