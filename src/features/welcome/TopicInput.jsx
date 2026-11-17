"use client";

import { ArrowUp, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { ModelControls } from "@/features/model-settings/ModelControls";
import { welcomeStyles as s } from "./style";

export function TopicInput({
  topic,
  onTopicChange,
  level,
  onLevelChange,
  model,
  effort,
  onEffortChange,
  pending,
  disabled,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <InputGroup className={s.form}>
        <label htmlFor="lesson-topic" className="sr-only">
          What would you like to understand?
        </label>
        <InputGroupTextarea
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
        <InputGroupAddon align="block-end" className={s.formFooter}>
          <ModelControls
            model={model}
            effort={effort}
            onEffortChange={onEffortChange}
            level={level}
            onLevelChange={onLevelChange}
            disabled={pending}
          />
          <div className="ml-auto flex items-center gap-3">
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
              <span className="hidden text-[10px] text-muted-foreground 2xl:inline">
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
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
