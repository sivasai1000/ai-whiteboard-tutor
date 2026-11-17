"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, Clock3, Layers3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { libraryStyles as s } from "./style";

function lessonDate(date) {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? "Recently"
    : value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function LessonList({ lessons, onBookmark, onDelete, busyId }) {
  return (
    <ul className={s.list}>
      {lessons.map((lesson) => (
        <li key={lesson.id} className={s.row}>
          <Link
            href={`/lesson/${lesson.id}`}
            aria-label={`Open ${lesson.title}`}
            className={s.icon}
          >
            <Layers3 className="size-5" strokeWidth={1.5} />
          </Link>
          <Link href={`/lesson/${lesson.id}`} className="min-w-0 flex-1">
            <h2 className={s.title}>{lesson.title}</h2>
            <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
              {lesson.summary}
            </p>
            <div className={s.meta}>
              <span>{lessonDate(lesson.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Clock3 className="size-3" />
                {Math.max(
                  1,
                  Math.round(
                    lesson.scenes.reduce(
                      (sum, scene) => sum + (scene.duration || 0),
                      0,
                    ) / 60,
                  ),
                )}{" "}
                min
              </span>
              <span>{lesson.level}</span>
              {lesson.source === "sample" && (
                <span className="text-amber-300/70">Prewritten sample</span>
              )}
            </div>
          </Link>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "size-11 text-muted-foreground",
                    lesson.saved && "text-primary",
                  )}
                  disabled={busyId === lesson.id}
                  aria-label={
                    lesson.saved
                      ? `Unsave ${lesson.title}`
                      : `Save ${lesson.title}`
                  }
                  onClick={() => onBookmark(lesson)}
                >
                  <Bookmark
                    className={cn("size-4", lesson.saved && "fill-primary/20")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {lesson.saved ? "Remove bookmark" : "Save lesson"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-11 text-muted-foreground hover:text-destructive"
                  disabled={busyId === lesson.id}
                  aria-label={`Delete ${lesson.title}`}
                  onClick={() => onDelete(lesson)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete from this device</TooltipContent>
            </Tooltip>
            <ArrowUpRight className="ml-2 hidden size-4 text-muted-foreground/40 sm:block" />
          </div>
        </li>
      ))}
    </ul>
  );
}
