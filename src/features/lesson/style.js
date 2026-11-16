export const lessonStyles = {
  workspace:
    "flex min-h-[calc(100dvh-64px)] flex-1 flex-col lg:h-dvh lg:min-h-0",
  toolbar:
    "flex min-h-20 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-7",
  toolbarKicker:
    "mb-1.5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
  toolbarTitle:
    "max-w-[48vw] truncate text-sm font-medium tracking-[-0.02em] sm:max-w-none sm:text-base",
  body: "flex min-h-0 flex-1 flex-col xl:flex-row",
  main: "relative flex min-w-0 flex-1 flex-col px-4 pb-5 pt-6 sm:px-7 sm:pt-8",
  sceneHeading: "flex items-start justify-between gap-4 pb-6",
  sceneCount:
    "mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary/80",
  sceneTitle: "text-lg font-medium tracking-[-0.03em] sm:text-[23px]",
  boardShell:
    "relative flex min-h-64 flex-1 items-center overflow-hidden rounded-xl border border-white/[0.045] bg-[#141419] sm:min-h-80",
  board: "h-full max-h-[62dvh] w-full min-w-0 select-none",
  boardNote:
    "absolute left-4 top-4 flex items-center gap-2 text-[10px] text-muted-foreground/60",
  caption:
    "mx-auto flex min-h-20 max-w-3xl items-center justify-center px-3 py-4 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm",
  player:
    "mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#212127] px-4 py-3 shadow-xl shadow-black/10 sm:gap-5 sm:px-5",
  playButton:
    "size-11 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
  playerMiddle: "min-w-0 flex-1 space-y-2",
  playerLabel:
    "flex items-center justify-between gap-3 text-[10px] text-muted-foreground",
  segments: "mt-5 flex flex-wrap items-center justify-center gap-1.5",
  segment:
    "flex size-7 items-center justify-center rounded-full text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary",
  segmentActive: "bg-primary/10 text-primary ring-1 ring-primary/20",
  disclosure:
    "mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground/70",
  loading:
    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/90 px-6 text-center backdrop-blur-sm",
  error:
    "mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive",
  chat: "flex w-full shrink-0 flex-col border-t border-border xl:w-[330px] xl:border-l xl:border-t-0 2xl:w-[360px]",
};

export const boardColors = {
  violet: "#b5a0f5",
  cyan: "#79c9dc",
  amber: "#e9bd76",
  green: "#8ad6b3",
  white: "#e5e4ed",
  muted: "#92909f",
};
