import { ArrowUp, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { tutorStyles as s } from "./style";

export function ChatComposer({ value, onChange, onSubmit, pending }) {
  return (
    <div className={s.composer}>
      <form onSubmit={onSubmit} className={s.form}>
        <label htmlFor="tutor-question" className="sr-only">
          Ask a follow-up question
        </label>
        <Textarea
          id="tutor-question"
          placeholder="A question, a thought, a what if…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={1000}
          disabled={pending}
          className={s.textarea}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (!pending && value.trim()) onSubmit(event);
            }
          }}
        />
        <div className="flex items-center justify-between px-3 pb-2.5">
          <span className="text-[9px] text-muted-foreground">
            Enter to send · Shift + Enter for a new line
          </span>
          <Button
            type="submit"
            size="icon"
            className="size-7 rounded-lg"
            disabled={!value.trim() || pending}
            aria-label="Send question"
          >
            {pending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <ArrowUp className="size-3.5" />
            )}
          </Button>
        </div>
      </form>
      <p className="mt-2.5 text-center text-[9px] text-muted-foreground">
        AI can make mistakes. Stay curious, check the details.
      </p>
    </div>
  );
}
