"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Headphones,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessons } from "@/features/library/LessonProvider";
import { TutorChat } from "@/features/tutor/TutorChat";
import { cn } from "@/lib/utils";
import { LessonToolbar } from "./LessonToolbar";
import { LessonPlayer } from "./LessonPlayer";
import { Whiteboard } from "./Whiteboard";
import { useLessonPlayer } from "./useLessonPlayer";
import { lessonStyles as s } from "./style";

function ActiveLesson({ lesson }) {
  const { updateLesson } = useLessons();
  const player = useLessonPlayer(lesson);
  const [chatOpen, setChatOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const state = player.state;

  async function toggleSaved() {
    setSaving(true);
    setSaveError("");
    try {
      await updateLesson(lesson.id, { saved: !lesson.saved });
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={s.workspace}>
      <LessonToolbar
        lesson={lesson}
        onSave={toggleSaved}
        saving={saving}
        chatOpen={chatOpen}
        onToggleChat={() => {
          player.pause();
          setChatOpen((value) => !value);
        }}
      />
      <div className={s.body}>
        <section
          className={cn(s.main, chatOpen && "hidden xl:flex")}
          aria-label="Interactive lesson"
        >
          <div className={s.sceneHeading}>
            <div>
              <p className={s.sceneCount}>
                CHAPTER {String(state.index + 1).padStart(2, "0")}{" "}
                <span className="px-1 text-muted-foreground/40">/</span>{" "}
                {String(lesson.scenes.length).padStart(2, "0")}
              </p>
              <h2 className={s.sceneTitle} data-testid="scene-title">
                {state.scene.title}
              </h2>
            </div>
            <span className="mt-1 hidden items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] text-primary sm:flex">
              <span className="size-1 rounded-full bg-primary" /> Visual
              learning
            </span>
          </div>
          {saveError && (
            <p role="alert" className={s.error}>
              {saveError}
            </p>
          )}
          {player.error && (
            <div role="alert" className={s.error}>
              <p>{player.error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-foreground"
                onClick={player.retry}
              >
                Reload narration
              </Button>
            </div>
          )}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <Whiteboard scene={state.scene} progress={state.progress} />
            {player.loading && (
              <div className={s.loading} role="status">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Headphones className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Giving your lesson a voice
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Preparing chapter{" "}
                    {Math.min(player.loadedCount + 1, lesson.scenes.length)} of{" "}
                    {lesson.scenes.length}. This can take a moment.
                  </p>
                </div>
                <LoaderCircle className="size-4 animate-spin text-primary" />
              </div>
            )}
          </div>
          <p className={s.caption}>{state.scene.narration}</p>
          <LessonPlayer player={player} />
          <nav className={s.segments} aria-label="Lesson chapters">
            {player.timeline.map((segment, index) => (
              <button
                key={segment.scene.id}
                className={cn(
                  s.segment,
                  index === state.index && s.segmentActive,
                )}
                aria-label={`Chapter ${index + 1}: ${segment.scene.title}`}
                aria-current={index === state.index ? "step" : undefined}
                disabled={!player.ready}
                onClick={() => player.seek(segment.start)}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </nav>
          <div className={s.disclosure}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-2.5" />
              {lesson.source === "sample"
                ? "Prewritten preview · synthetic narration"
                : "AI-generated lesson & voice"}
            </span>
            <span>Saved on this device</span>
          </div>
          {player.ready && player.time >= player.total && (
            <Button
              variant="ghost"
              className="mt-3 text-xs text-primary xl:hidden"
              onClick={() => setChatOpen(true)}
            >
              Keep exploring with your tutor{" "}
              <ArrowRight className="ml-2 size-3" />
            </Button>
          )}
        </section>
        <aside
          className={cn(
            s.chat,
            !chatOpen && "hidden xl:flex",
            chatOpen && "min-h-[calc(100dvh-160px)]",
          )}
          aria-label="AI tutor chat"
        >
          <TutorChat lesson={lesson} onPause={player.pause} />
        </aside>
      </div>
    </div>
  );
}

export function LessonWorkspace({ lessonId }) {
  const { ready, getLesson, storageError } = useLessons();
  if (!ready)
    return (
      <div
        className="flex min-h-[70dvh] items-center justify-center gap-3 text-sm text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="size-4 animate-spin" />
        Opening your lesson…
      </div>
    );
  const lesson = getLesson(lessonId);
  if (!lesson)
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <p className="text-xl font-medium">This lesson isn’t on this device</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {storageError ||
            "Lessons are saved in your browser. Start a new lesson here, or open it on the device where you created it."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Start a new lesson
          </Link>
        </Button>
      </div>
    );
  return <ActiveLesson key={lesson.id} lesson={lesson} />;
}
