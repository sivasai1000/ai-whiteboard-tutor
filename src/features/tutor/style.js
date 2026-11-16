export const tutorStyles = {
  panel: "flex h-full min-h-0 flex-col bg-card/20",
  header:
    "flex shrink-0 items-center gap-2.5 border-b border-border/65 px-5 py-5",
  avatar:
    "flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary",
  messages: "min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6",
  assistant:
    "text-[12px] leading-[1.85] whitespace-pre-wrap text-foreground/85",
  user: "ml-4 rounded-xl rounded-br-sm border border-border/65 bg-secondary/70 px-3.5 py-3 text-[12px] leading-6 whitespace-pre-wrap text-foreground/90",
  suggestion:
    "flex w-full items-center justify-between gap-2 rounded-lg border border-border/75 px-3 py-2.5 text-left text-[11px] leading-5 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
  composer: "shrink-0 border-t border-border/65 p-4",
  form: "overflow-hidden rounded-xl border border-border bg-background/65 transition-colors focus-within:border-primary/45",
  textarea:
    "max-h-32 min-h-16 resize-none border-0 bg-transparent px-3.5 py-3 text-xs shadow-none placeholder:text-muted-foreground/65 focus-visible:ring-0",
};
