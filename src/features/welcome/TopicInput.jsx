"use client";

import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { ModelControls } from "@/features/model-settings/ModelControls";
import { composerStyles as s } from "@/components/composer/style";

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
    <form onSubmit={onSubmit} className="mt-6 w-full min-w-0 sm:mt-8">
      <InputGroup className={s.shell}>
        <label htmlFor="lesson-topic" className="sr-only">
          What would you like to understand?
        </label>
        <InputGroupTextarea
          id="lesson-topic"
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
          placeholder="What would you like to learn?"
          className={s.textarea}
          rows={2}
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
        <InputGroupAddon align="block-end" className={s.footer}>
          <ModelControls
            model={model}
            effort={effort}
            onEffortChange={onEffortChange}
            level={level}
            onLevelChange={onLevelChange}
            disabled={pending}
          />
          <div className={s.actions}>
            <Button
              type={pending ? "button" : "submit"}
              onClick={pending ? onCancel : undefined}
              disabled={!pending && (disabled || topic.trim().length < 3)}
              className={pending ? s.iconSend : s.send}
              aria-label={
                pending ? "Cancel lesson generation" : "Start learning"
              }
            >
              {pending ? (
                <Square className="size-3.5 fill-current" />
              ) : (
                <>
                  <span className="hidden sm:inline">Start learning</span>
                  <ArrowUp className="size-4" />
                </>
              )}
            </Button>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
