"use client";

import { ArrowUp, LoaderCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { welcomeStyles as s } from "./style";

export function TopicInput({
  topic,
  onTopicChange,
  level,
  onLevelChange,
  pending,
  disabled,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className={s.form}>
      <label htmlFor="lesson-topic" className="sr-only">
        What would you like to understand?
      </label>
      <Textarea
        id="lesson-topic"
        value={topic}
        onChange={(event) => onTopicChange(event.target.value)}
        placeholder="What would you like to understand?"
        className={s.textarea}
        maxLength={240}
        disabled={pending}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            if (!disabled && !pending && topic.trim().length >= 3)
              onSubmit(event);
          }
        }}
      />
      <div className={s.formFooter}>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <SlidersHorizontal className="mr-1 size-3.5" />
          <div className="flex gap-0.5" role="group" aria-label="Lesson level">
            {["Beginner", "Intermediate"].map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                aria-pressed={level === option}
                onClick={() => onLevelChange(option)}
                className={cn(
                  s.levelButton,
                  level === option
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pending ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 text-xs"
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : (
            <span className="hidden text-[10px] text-muted-foreground/45 sm:inline">
              ⌘ / Ctrl + Enter
            </span>
          )}
          <Button
            type="submit"
            disabled={disabled || pending || topic.trim().length < 3}
            className={s.submit}
          >
            {pending ? (
              <>
                <LoaderCircle className="size-3.5 animate-spin" />
                Creating lesson
              </>
            ) : (
              <>
                Start learning
                <ArrowUp className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
