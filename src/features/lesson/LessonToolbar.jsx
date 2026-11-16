"use client";

import {
  Bookmark,
  Check,
  ChevronLeft,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { lessonStyles as s } from "./style";

export function LessonToolbar({
  lesson,
  onSave,
  onToggleChat,
  chatOpen,
  saving,
}) {
  return (
    <header className={s.toolbar}>
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          asChild
        >
          <Link href="/" aria-label="Back to new lesson">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <div className={s.toolbarKicker}>
            <Sparkles className="size-3 text-primary" />
            {lesson.source === "sample"
              ? "SAMPLE LESSON"
              : "YOUR PERSONAL LESSON"}
            <span className="text-muted-foreground/30">/</span>
            {lesson.level}
          </div>
          <h1 className={s.toolbarTitle}>{lesson.title}</h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          disabled={saving}
          onClick={onSave}
          aria-label={lesson.saved ? "Unsave lesson" : "Save lesson"}
        >
          {lesson.saved ? (
            <Check className="size-4 text-primary" />
          ) : (
            <Bookmark className="size-4" />
          )}
          <span className="hidden sm:inline">
            {lesson.saved ? "Saved" : "Save"}
          </span>
        </Button>
        <Button
          variant={chatOpen ? "secondary" : "ghost"}
          size="icon"
          className="size-8 xl:hidden"
          onClick={onToggleChat}
          aria-label={chatOpen ? "Show whiteboard" : "Open tutor chat"}
        >
          <MessageCircle className="size-4" />
        </Button>
      </div>
    </header>
  );
}
