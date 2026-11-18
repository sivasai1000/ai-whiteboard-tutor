export const aiStyles = {
  workspace:
    "flex h-[calc(100dvh-3.25rem)] min-h-0 min-w-0 flex-col overflow-hidden lg:h-dvh",
  header:
    "flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 sm:px-7",
  eyebrow: "text-[10px] font-medium text-muted-foreground",
  empty:
    "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8",
  emptyContent:
    "mx-auto my-auto flex w-full max-w-[680px] min-w-0 flex-col items-center py-6 text-center sm:pb-16",
  heading:
    "max-w-full font-heading text-[26px] font-medium leading-[1.2] tracking-[-0.035em] sm:text-[34px]",
  subtitle: "mt-3 text-[13px] leading-6 text-muted-foreground sm:text-sm",
  composerDock:
    "mx-auto w-full max-w-[728px] shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-4",
  footer: "mt-3 text-center text-[10px] leading-4 text-muted-foreground",
  messages:
    "mx-auto w-full max-w-3xl gap-6 px-4 pb-6 pt-5 sm:gap-8 sm:px-8 sm:pt-8",
  userBubble: "max-w-[90%] sm:max-w-[85%]",
  userText:
    "rounded-2xl bg-secondary/70 px-4 py-3 text-[13px] leading-6 sm:text-sm whitespace-pre-wrap",
  assistantText:
    "min-w-0 text-[13px] leading-7 text-foreground/90 sm:text-sm [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_a]:text-primary [&_a]:underline [&_table]:text-sm",
  action: "size-11 shrink-0 text-muted-foreground hover:text-foreground",
  alert:
    "mx-auto flex w-full max-w-3xl items-start gap-3 px-5 py-3 text-xs leading-5 text-destructive sm:px-8",
  libraryPage: "mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 lg:px-10 lg:py-9",
  libraryHeadingRow: "flex flex-wrap items-start justify-between gap-6",
  libraryEyebrow: "text-xs font-medium text-muted-foreground",
  libraryHeading:
    "mt-3 font-heading text-2xl font-medium tracking-[-0.035em] sm:text-3xl",
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
