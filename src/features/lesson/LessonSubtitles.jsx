"use client";

import { useMemo } from "react";
import { buildSubtitleCues, resolveSubtitle } from "./subtitles";
import {
  estimateWordTimings,
  validWordTimings,
  revealedSubtitle,
} from "@/lib/word-timing";
import { lessonStyles as s } from "./style";

export function LessonSubtitles({
  narration,
  duration,
  time,
  loading,
  measuredCue,
}) {
  const cues = useMemo(
    () => buildSubtitleCues(narration, duration),
    [narration, duration],
  );
  const cue = measuredCue || resolveSubtitle(cues, time);
  const words = useMemo(
    () =>
      cue ? (validWordTimings(cue) ? cue.words : estimateWordTimings(cue)) : [],
    [cue],
  );
  const text = loading
    ? "Preparing your narration…"
    : revealedSubtitle(words, time);
  return (
    <div className={s.caption} aria-label="Lesson subtitles" aria-live="off">
      <div className={s.subtitleStack}>
        <p aria-hidden="true" className={s.subtitleMeasure}>
          {loading ? "Preparing your narration…" : cue?.text || " "}
        </p>
        <p
          data-testid="lesson-subtitle"
          data-timing={
            words.every((word) => word.source === "aligned")
              ? "aligned"
              : "estimated"
          }
          className={s.subtitleText}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
