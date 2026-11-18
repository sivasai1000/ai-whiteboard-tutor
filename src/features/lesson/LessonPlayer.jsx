"use client";

import { Pause, Play, RotateCcw, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/utils";
import { lessonStyles as s } from "./style";

export function LessonPlayer({ player }) {
  const speeds = [1, 1.25, 1.5, 0.75];
  return (
    <div className={s.player} aria-label="Lesson playback controls">
      <div className={s.playerControls}>
        <Button
          size="icon"
          className={s.playButton}
          onClick={player.playing ? player.pause : player.play}
          disabled={!player.ready}
          aria-label={player.playing ? "Pause lesson" : "Play lesson"}
        >
          {player.playing ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="ml-0.5 size-4 fill-current" />
          )}
        </Button>
        {player.buffering && (
          <LoaderCircle
            className="size-3.5 animate-spin text-primary"
            aria-label="Waiting for narration"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          className={s.mediaButton}
          onClick={player.restart}
          disabled={!player.ready}
          aria-label="Restart lesson"
          title="Restart lesson"
        >
          <RotateCcw className="size-4" />
        </Button>
        <span className={s.mediaTime} data-testid="playback-time">
          {formatTime(player.time)} <span className="text-slate-300">/</span>{" "}
          {player.loadedCount < player.chapterCount ? "~" : ""}
          {formatTime(player.total)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className={s.speedButton}
          onClick={() =>
            player.setSpeed(
              speeds[(speeds.indexOf(player.speed) + 1) % speeds.length],
            )
          }
          aria-label={`Playback speed ${player.speed} times. Change speed`}
          title="Change playback speed"
        >
          {player.speed}×
        </Button>
      </div>
      {(player.preparing || player.buffering) && (
        <p className={s.preparationStatus} role="status">
          {player.buffering
            ? `Preparing chapter ${player.state.index + 1}…`
            : `${player.loadedCount} of ${player.chapterCount} chapters ready${player.ready ? " · You can start listening" : ""}`}
        </p>
      )}
      <Slider
        className={s.mediaTimeline}
        value={[player.time]}
        min={0}
        max={player.total || 1}
        step={0.1}
        onValueChange={([value]) => player.seek(value)}
        disabled={!player.ready}
        aria-label="Lesson timeline"
        aria-valuetext={`${formatTime(player.time)} of ${formatTime(player.total)}`}
      />
    </div>
  );
}
