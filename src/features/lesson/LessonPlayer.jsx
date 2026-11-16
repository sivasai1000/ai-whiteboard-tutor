"use client";

import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTime } from "@/lib/utils";
import { lessonStyles as s } from "./style";

export function LessonPlayer({ player }) {
  const speeds = [1, 1.25, 1.5, 0.75];
  return (
    <div className={s.player} aria-label="Lesson playback controls">
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
      <div className={s.playerMiddle}>
        <div className={s.playerLabel}>
          <span>
            {player.playing
              ? "NOW PLAYING"
              : player.time >= player.total
                ? "LESSON COMPLETE"
                : "YOUR MOMENT OF CLARITY"}
          </span>
          <span
            className="shrink-0 font-mono tabular-nums"
            data-testid="playback-time"
          >
            {formatTime(player.time)}{" "}
            <span className="text-muted-foreground/40">/</span>{" "}
            {formatTime(player.total)}
          </span>
        </div>
        <Slider
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
      <div className="flex shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              onClick={player.restart}
              disabled={!player.ready}
              aria-label="Restart lesson"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Restart lesson</TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="sm"
          className="hidden w-10 px-0 font-mono text-xs text-muted-foreground sm:flex"
          onClick={() =>
            player.setSpeed(
              speeds[(speeds.indexOf(player.speed) + 1) % speeds.length],
            )
          }
          aria-label={`Playback speed ${player.speed} times. Change speed`}
        >
          {player.speed}×
        </Button>
        <Volume2
          className="ml-1 hidden size-3.5 text-muted-foreground/50 sm:block"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
