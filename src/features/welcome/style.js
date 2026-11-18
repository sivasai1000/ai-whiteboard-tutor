export const welcomeStyles = {
  screen:
    "relative flex min-h-[calc(100dvh-3.25rem)] min-w-0 flex-col px-4 pb-4 sm:px-8 lg:min-h-full lg:px-10",
  topbar: "hidden h-14 shrink-0 items-center justify-between gap-4 lg:flex",
  content:
    "mx-auto flex w-full max-w-[680px] min-w-0 flex-1 flex-col items-center justify-center py-8 text-center sm:py-12 lg:pb-20",
  heading:
    "max-w-full font-heading text-[26px] font-medium leading-[1.2] tracking-[-0.035em] sm:text-[34px]",
  intro: "mt-3 text-[13px] leading-6 text-muted-foreground sm:text-sm",
};

export const samplePreviewStyles = {
  card: "group mt-5 flex w-full min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-card/60 p-2.5 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground disabled:pointer-events-none disabled:opacity-50 sm:mt-6 sm:gap-4 sm:p-3",
  art: "relative flex h-16 w-20 shrink-0 items-center overflow-hidden rounded-lg bg-slate-900 sm:h-20 sm:w-32",
  thumbnail: "block h-auto w-full",
  play: "absolute inset-0 flex items-center justify-center bg-black/15 text-white sm:inset-auto sm:bottom-1.5 sm:right-1.5 sm:size-6 sm:rounded-full sm:bg-white/10",
  content: "flex min-w-0 flex-1 flex-col py-0.5",
  eyebrow:
    "flex items-center gap-1.5 whitespace-nowrap text-[10px] font-medium tracking-wide text-muted-foreground",
  title:
    "mt-1 text-[13px] font-medium leading-5 tracking-tight text-foreground sm:text-sm",
  description: "mt-1 hidden text-xs leading-5 text-muted-foreground sm:block",
  action:
    "mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-primary sm:mt-2",
};

export const exploreStyles = {
  page: "mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-9",
  heading:
    "mt-3 font-heading text-2xl font-medium tracking-[-0.035em] sm:text-3xl",
  filters: "mt-6 flex flex-wrap gap-2 border-b border-border pb-5",
  topic:
    "group flex min-h-36 flex-col border-b border-border/65 py-5 transition-colors",
};
