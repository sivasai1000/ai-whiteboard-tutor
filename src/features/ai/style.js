export const aiStyles = {
  workspace:
    "flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden lg:h-dvh",
  header:
    "flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 px-5 sm:px-8",

  eyebrow: "text-[11px] font-medium text-muted-foreground",
  empty: "flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-10 sm:px-10",
  emptyContent:
    "mx-auto my-auto flex w-full max-w-[720px] flex-col items-start py-6",
  welcomeEyebrow: "text-[11px] font-medium tracking-[0.16em] text-primary",
  heading:
    "mt-4 font-heading text-[30px] font-semibold leading-[1.2] tracking-[-0.035em] sm:text-[38px]",
  subtitle: "mt-4 max-w-xl text-sm leading-6 text-muted-foreground",
  suggestions: "mt-5 flex flex-wrap justify-start gap-2",
  suggestion:
    "flex min-h-11 items-center gap-2 rounded-lg border border-transparent bg-secondary/40 px-3.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-muted-foreground disabled:opacity-50",
  welcomeNote: "mt-6 text-xs leading-6 text-muted-foreground",
  composer:
    "w-full rounded-2xl border-border bg-card shadow-xl shadow-foreground/[0.035]",
  textarea:
    "max-h-48 min-h-24 px-5 py-5 text-base leading-7 placeholder:text-muted-foreground sm:text-[15px]",
  composerFooter: "flex-wrap justify-between gap-2 px-3 pb-3 sm:px-4",
  composerHint: "hidden text-[11px] text-muted-foreground lg:inline",
  composerDock:
    "mx-auto w-full max-w-3xl shrink-0 px-5 pb-4 pt-3 sm:px-8 sm:pb-5",
  footer: "mt-3 text-center text-[10px] leading-4 text-muted-foreground",
  messages: "mx-auto w-full max-w-3xl gap-8 px-5 pb-8 pt-7 sm:px-8 sm:pt-10",
  userBubble: "max-w-[90%] sm:max-w-[85%]",
  userText:
    "rounded-2xl bg-secondary/70 px-5 py-3.5 text-sm leading-6 whitespace-pre-wrap",
  assistantText:
    "min-w-0 text-sm leading-7 text-foreground/90 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_a]:text-primary [&_a]:underline [&_table]:text-sm",
  action: "size-11 shrink-0 text-muted-foreground hover:text-foreground",
  alert:
    "mx-auto flex w-full max-w-3xl items-start gap-3 px-5 py-3 text-xs leading-5 text-destructive sm:px-8",
  libraryPage: "mx-auto w-full max-w-5xl px-5 py-9 sm:px-10 lg:px-12 lg:py-12",
  libraryHeadingRow: "flex flex-wrap items-start justify-between gap-6",
  libraryEyebrow: "text-xs font-medium text-muted-foreground",
  libraryHeading:
    "mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl",
  libraryDescription: "mt-3 text-sm leading-6 text-muted-foreground",
  libraryToolbar:
    "mt-9 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6",
  librarySearch: "h-11 rounded-lg border-border bg-card pl-10 text-sm",
  libraryList: "divide-y divide-border",
  libraryRow: "group flex items-start gap-4 py-5 sm:gap-5",
  libraryLink:
    "min-w-0 flex-1 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-muted-foreground",
  libraryTitle:
    "truncate text-sm font-medium transition-colors group-hover:text-primary",
  libraryPreview:
    "mt-2 line-clamp-1 text-[13px] leading-6 text-muted-foreground",
  libraryMeta: "mt-2 text-xs text-muted-foreground",
};
