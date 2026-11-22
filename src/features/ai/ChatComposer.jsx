"use client";

import { useRef } from "react";
import { ArrowUp, Square, Loader2 } from "lucide-react";
import { ModelControls } from "@/features/model-settings/ModelControls";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { MAX_CHAT_INPUT } from "@/lib/conversation-schema";
import { composerStyles as s } from "@/components/composer/style";

export function ChatComposer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  preparing,
  disabled,
  model,
  effort,
  onEffortChange,
}) {
  const composing = useRef(false);
  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy && !disabled && value.trim()) onSend(value.trim());
      }}
    >
      <InputGroup className={s.shell}>
        <label htmlFor="ai-chat-input" className="sr-only">
          Message Look
        </label>
        <InputGroupTextarea
          id="ai-chat-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Message Look…"
          rows={2}
          maxLength={MAX_CHAT_INPUT}
          disabled={disabled || preparing}
          className={s.textarea}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !composing.current &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault();
              if (!busy && !disabled && value.trim())
                event.currentTarget.form.requestSubmit();
            }
          }}
        />
        <InputGroupAddon align="block-end" className={s.footer}>
          <ModelControls
            model={model}
            effort={effort}
            onEffortChange={onEffortChange}
            disabled={busy || disabled}
          />
          <div className={s.actions}>
            <span className={s.hint}>
              {value.length > 3500
                ? `${value.length} / ${MAX_CHAT_INPUT}`
                : "Shift + Enter for a new line"}
            </span>
            <InputGroupButton
              type={busy ? "button" : "submit"}
              variant="default"
              size="icon-sm"
              className={s.iconSend}
              disabled={preparing || (!busy && (disabled || !value.trim()))}
              onClick={busy ? onStop : undefined}
              aria-label={
                preparing
                  ? "Preparing message"
                  : busy
                    ? "Stop response"
                    : "Send message"
              }
            >
              {preparing ? (
                <Loader2 className="size-4 motion-safe:animate-spin" />
              ) : busy ? (
                <Square className="size-3.5 fill-current" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </InputGroupButton>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
