"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Headphones, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessons } from "@/features/library/LessonProvider";
import { TutorChat } from "@/features/tutor/TutorChat";
import { cn } from "@/lib/utils";
import { LessonToolbar } from "./LessonToolbar";
import { LessonPlayer } from "./LessonPlayer";
import { Whiteboard } from "./Whiteboard";
import { useLessonPlayer } from "./useLessonPlayer";
import { useLessonFullscreen } from "./useLessonFullscreen";
import { LessonSubtitles } from "./LessonSubtitles";
import { lessonStyles as s } from "./style";

function ActiveLesson({ lesson }) {
  const { updateLesson } = useLessons();
  const player = useLessonPlayer(lesson);
  const fullscreen = useLessonFullscreen();
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
          ref={fullscreen.ref}
          className={cn(
            s.main,
            chatOpen && "hidden xl:flex",
            fullscreen.active && s.fullscreen,
            fullscreen.expanded && "fixed inset-0 z-50",
          )}
          aria-label="Interactive lesson"
          data-fullscreen={fullscreen.active}
          data-expanded={fullscreen.expanded}
          role={fullscreen.expanded ? "dialog" : undefined}
          aria-modal={fullscreen.expanded ? true : undefined}
          tabIndex={fullscreen.expanded ? -1 : undefined}
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
          {fullscreen.expanded && (
            <p role="status" className="sr-only">
              Expanded lesson view. Press Escape to close.
            </p>
          )}
          {saveError && (
            <p role="alert" className={s.error}>
              {saveError}
            </p>
          )}
          {fullscreen.error && (
            <p role="status" className={s.error}>
              {fullscreen.error}
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
                disabled={player.retryDisabled}
              >
                {player.retryLabel}
              </Button>
            </div>
          )}
          <div className={s.boardStage}>
            <Whiteboard
              scene={state.scene}
              progress={state.progress}
              stepIndex={state.stepIndex}
              cueProgress={state.cueProgress}
              elapsed={state.localTime - (state.cue?.start || 0)}
              fullscreen={fullscreen.active}
              onToggleFullscreen={fullscreen.toggle}
            >
              <div className={s.mediaOverlay}>
                <LessonSubtitles
                  narration={state.scene.narration}
                  duration={state.duration}
                  time={state.localTime}
                  loading={player.loading || (player.buffering && !state.cue)}
                  measuredCue={state.cue}
                />
                <LessonPlayer player={player} />
              </div>
            </Whiteboard>
            {player.loading && (
              <div className={s.loading} role="status">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Headphones className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {lesson.source === "sample"
                      ? "Loading sample narration"
                      : "Giving your lesson a voice"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Preparing the opening chapter. You can start listening while
                    the rest of your lesson loads.
                  </p>
                </div>
                <LoaderCircle className="size-4 animate-spin text-primary" />
              </div>
            )}
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
