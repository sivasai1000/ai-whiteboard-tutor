"use client";

import { useRef } from "react";
import { ArrowUp, Square, Sparkles, Loader2 } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { MAX_CHAT_INPUT } from "@/lib/conversation-schema";
import { aiStyles as s } from "./style";

export function ChatComposer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  preparing,
  disabled,
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
      <InputGroup className={s.composer}>
        <label htmlFor="ai-chat-input" className="sr-only">
          Message Luma
        </label>
        <InputGroupTextarea
          id="ai-chat-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask a question, explore an idea…"
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
        <InputGroupAddon align="block-end" className={s.composerFooter}>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Luma AI
          </span>
          <div className="flex items-center gap-3">
            <span className={s.composerHint}>
              {value.length > 3500
                ? `${value.length} / ${MAX_CHAT_INPUT}`
                : "Shift + Enter for a new line"}
            </span>
            <InputGroupButton
              type={busy ? "button" : "submit"}
              variant="default"
              size="icon-sm"
              className="size-10 rounded-xl"
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
