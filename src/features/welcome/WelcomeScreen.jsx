"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Clock3, Headphones, Play, Sparkles } from "lucide-react";
import { useLessons } from "@/features/library/LessonProvider";
import { apiRequest } from "@/lib/api";
import { createSampleLesson } from "@/lib/sample-lesson";
import { ErrorState } from "@/components/shared/ErrorState";
import { TopicInput } from "./TopicInput";
import { SuggestedTopics } from "./SuggestedTopics";
import { CuriosityMark, SampleIllustration } from "./CuriosityMark";
import { welcomeStyles as s } from "./style";

export function WelcomeScreen({ initialTopic = "" }) {
  const router = useRouter();
  const { saveLesson, ready, storageError, lessons } = useLessons();
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState("Beginner");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef(null);
  const libraryFull = lessons.length >= 30;
  const unavailable = !ready || Boolean(storageError) || libraryFull;
  useEffect(() => () => controller.current?.abort(), []);

  async function generateLesson(event) {
    event.preventDefault();
    if (pending || unavailable || topic.trim().length < 3) return;
    const requestController = new AbortController();
    controller.current = requestController;
    setPending(true);
    setError("");
    try {
      const { lesson } = await apiRequest(
        "/api/lessons",
        { topic: topic.trim(), level },
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

  async function openSample() {
    if (unavailable || pending) return;
    setError("");
    try {
      const lesson = createSampleLesson();
      await saveLesson(lesson);
      router.push(`/lesson/${lesson.id}`);
    } catch (cause) {
      setError(cause.message || "The preview couldn’t be opened.");
    }
  }

  return (
    <div className={s.screen}>
      <div className={s.topbar}>
        <p className="text-xs text-muted-foreground">Your learning space</p>
        <span className="flex items-center gap-2 text-[10px] text-muted-foreground/75">
          <Clock3 className="size-3.5" />A few minutes. A fresh perspective.
        </span>
      </div>
      <section className={s.content} aria-labelledby="welcome-heading">
        <CuriosityMark />
        <p className={s.eyebrow}>For the wonderfully curious</p>
        <h1 id="welcome-heading" className={s.heading}>
          Make room for
          <br />
          your next <span className="text-primary">big idea.</span>
        </h1>
        <p className={s.intro}>
          Pick a topic. Watch it come to life.
          <br />
          Your personal tutor, a whiteboard, and a little clarity.
        </p>
        <TopicInput
          topic={topic}
          onTopicChange={setTopic}
          level={level}
          onLevelChange={setLevel}
          pending={pending}
          disabled={unavailable}
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
            Creating your explanation and visual teaching steps. This may take a
            moment.
          </p>
        )}
        {error && (
          <div className="mt-4 w-full text-left">
            <ErrorState message={error} />
          </div>
        )}
        <SuggestedTopics
          disabled={pending}
          onSelect={(value) => {
            setTopic(value);
            document.getElementById("lesson-topic")?.focus();
          }}
        />
        <button
          type="button"
          onClick={openSample}
          disabled={unavailable || pending}
          className={s.sample}
        >
          <SampleIllustration />
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.13em] text-primary">
              <Play className="size-2.5 fill-current" />
              Prewritten preview
            </p>
            <h2 className="text-[13px] font-medium tracking-tight sm:text-sm">
              Why do we have seasons?
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              A small tilt. A whole world of change.
            </p>
          </div>
          <ArrowUpRight className="mr-1 size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </section>
      <footer className={s.footer}>
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3" />
          Made for understanding
        </span>
        <span className="hidden size-0.5 rounded-full bg-muted-foreground/50 sm:block" />
        <span className="flex items-center gap-1.5">
          <Headphones className="size-3" />
          Visual lessons. AI-generated voice.
        </span>
      </footer>
    </div>
  );
}
