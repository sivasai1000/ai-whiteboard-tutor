export const aiStyles = {
  workspace:
    "flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden lg:h-dvh",
  header:
    "flex h-18 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-5 sm:px-8",
  title: "truncate text-sm font-medium tracking-tight",
  eyebrow:
    "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
  empty:
    "flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-8 sm:px-8",
  emptyContent:
    "my-auto flex w-full max-w-2xl flex-col items-center text-center",
  heading:
    "mt-6 font-serif text-[36px] leading-tight tracking-[-0.035em] sm:text-5xl",
  subtitle: "mt-4 max-w-md text-sm leading-6 text-muted-foreground",
  suggestions: "mt-5 flex flex-wrap justify-center gap-2",
  suggestion:
    "flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card/50 px-3.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50",
  composer:
    "w-full rounded-2xl border-border bg-card shadow-lg shadow-black/10 dark:bg-card has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-primary/50",
  textarea:
    "max-h-48 min-h-24 px-5 py-4 text-base leading-7 placeholder:text-muted-foreground/60 sm:text-[15px]",
  composerFooter: "justify-between gap-3 px-4 pb-3",
  composerHint: "text-[10px] text-muted-foreground/70",
  composerDock:
    "mx-auto w-full max-w-3xl shrink-0 px-5 pb-4 pt-3 sm:px-8 sm:pb-5",
  footer: "mt-3 text-center text-[10px] leading-4 text-muted-foreground/70",
  messages: "mx-auto w-full max-w-3xl gap-8 px-5 pb-8 pt-7 sm:px-8 sm:pt-10",
  userBubble: "max-w-[90%] sm:max-w-[85%]",
  userText:
    "rounded-2xl bg-secondary/70 px-5 py-3.5 text-[15px] leading-7 whitespace-pre-wrap",
  assistantText:
    "min-w-0 text-[15px] leading-7 text-foreground/90 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_a]:text-primary [&_a]:underline [&_table]:text-sm",
  action: "size-9 text-muted-foreground hover:text-foreground",
  alert:
    "mx-auto flex w-full max-w-3xl items-start gap-3 px-5 py-3 text-xs leading-5 text-destructive sm:px-8",
};
