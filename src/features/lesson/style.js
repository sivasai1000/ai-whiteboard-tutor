export const lessonStyles = {
  workspace:
    "flex h-[calc(100dvh-52px)] min-h-[560px] flex-1 flex-col lg:h-dvh lg:min-h-0",
  toolbar:
    "flex min-h-14 shrink-0 items-center justify-between gap-1 border-b border-border px-2 sm:min-h-16 sm:gap-3 sm:px-7",
  toolbarKicker:
    "mb-1 hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:flex",
  toolbarTitle:
    "truncate text-[13px] font-medium tracking-[-0.02em] sm:text-base",
  body: "flex min-h-0 flex-1 flex-col xl:flex-row",
  main: "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-2 pb-2 pt-3 sm:px-6 sm:pb-4 sm:pt-6",
  fullscreen: "h-dvh w-screen bg-background px-2 py-2 sm:px-8 sm:py-5",
  sceneHeading:
    "flex shrink-0 items-start justify-between gap-3 px-1 pb-3 sm:px-0 sm:pb-5",
  sceneCount:
    "mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-primary",
  sceneTitle:
    "font-heading text-base font-medium leading-tight tracking-[-0.025em] sm:text-xl",
  boardStage: "relative flex min-h-0 flex-1 flex-col",
  boardShell:
    "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-board shadow-sm",
  boardHeader:
    "flex min-h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-2 sm:min-h-14 sm:px-5",
  boardNote:
    "flex min-w-0 items-center gap-2 text-xs font-medium text-foreground/80",
  boardMark:
    "flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/7 text-primary",
  boardStep:
    "ml-2 hidden border-l border-border pl-3 font-mono text-[10px] font-normal tabular-nums text-muted-foreground sm:inline",
  boardControls: "flex shrink-0 items-center gap-0.5",
  boardButton:
    "size-11 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground sm:size-8",
  fitButton:
    "h-11 w-11 rounded-lg px-0 font-mono text-[11px] tabular-nums text-muted-foreground hover:bg-accent sm:h-8",
  fullscreenButton: "ml-1 border-l border-border pl-1",
  boardViewport:
    "relative flex min-h-[120px] flex-1 items-start overflow-auto overscroll-contain bg-[radial-gradient(circle,var(--diagram-grid)_0.8px,transparent_0.8px)] [background-size:24px_24px] px-2 py-3 sm:px-7 sm:py-5",
  simulationViewport: "bg-[#0b1222] bg-none px-0 py-0 sm:px-0 sm:py-0",
  diagramFrame: "m-auto shrink-0",
  diagramFrameFit: "max-w-[1040px]",
  board: "h-full w-full min-w-0 select-none",
  diagramFit: "lg:max-h-[calc(100dvh-360px)] lg:min-h-[240px]",
  diagramFullscreen: "max-h-[calc(100dvh-270px)] min-h-[240px]",
  mediaOverlay: "relative z-20 flex w-full shrink-0 flex-col bg-board",
  visualTakeaway:
    "flex shrink-0 items-center justify-center gap-2 border-t border-border bg-primary/5 px-3 py-2 text-center text-[11px] font-medium leading-snug text-primary sm:text-xs",
  preparationStatus: "pb-1 text-[11px] leading-relaxed text-muted-foreground",
  caption:
    "flex min-h-12 w-full items-center justify-center px-3 py-2 text-center sm:min-h-16 sm:px-10 sm:py-3",
  subtitleStack: "grid w-full place-items-center",
  subtitleMeasure:
    "invisible col-start-1 row-start-1 max-w-[62ch] text-pretty text-xs leading-relaxed sm:text-sm",
  subtitleText:
    "col-start-1 row-start-1 max-w-[62ch] text-pretty text-xs leading-relaxed text-foreground/80 empty:hidden sm:text-sm",
  player:
    "flex w-full flex-col border-t border-border bg-muted/35 px-3 pb-1.5 pt-1 sm:px-5 sm:pb-3 sm:pt-2",
  playerControls: "flex min-h-11 items-center gap-2 sm:gap-3",
  playButton:
    "size-11 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90 sm:size-9",
  mediaButton:
    "size-11 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground sm:size-9",
  mediaTime:
    "ml-1 whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground",
  speedButton:
    "ml-auto h-11 w-12 rounded-lg px-0 text-[11px] font-medium text-foreground/80 hover:bg-accent hover:text-foreground sm:h-9",
  mediaTimeline:
    "py-2 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-border [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-thumb]]:shadow-sm",
  loading:
    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/90 px-6 text-center backdrop-blur-sm",
  error:
    "mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive",
  chat: "flex w-full shrink-0 flex-col border-t border-border xl:w-[330px] xl:border-l xl:border-t-0 2xl:w-[360px]",
};

export const boardColors = {
  violet: "var(--diagram-indigo)",
  cyan: "var(--diagram-cyan)",
  amber: "var(--diagram-amber)",
  green: "var(--diagram-teal)",
  // Preserve legacy schema names while adapting their contrast to the theme.
  white: "var(--diagram-ink)",
  muted: "var(--diagram-muted)",
};

export const visualizationColors = {
  indigo: { ink: "var(--diagram-indigo)", soft: "var(--diagram-indigo-soft)" },
  teal: { ink: "var(--diagram-teal)", soft: "var(--diagram-teal-soft)" },
  amber: { ink: "var(--diagram-amber)", soft: "var(--diagram-amber-soft)" },
  rose: { ink: "var(--diagram-rose)", soft: "var(--diagram-rose-soft)" },
};

export const moonSceneStyles = {
  canvas: "block h-auto w-full bg-[#0b1222] font-sans",
  compact: "[&_text]:text-[20px] [&_text]:tracking-normal",
  eyebrow: "fill-[#9fafd0] text-[12px] font-medium tracking-[0.14em]",
  caption: "fill-[#f1f5fb] text-[20px] font-medium tracking-tight",
  label: "fill-[#e5edf9] text-[18px] font-medium",
  small: "fill-[#abbcd6] text-[15px]",
  fine: "fill-[#8d9eb9] text-[11px]",
  phaseName: "fill-[#f1f5fb] text-[23px] font-medium tracking-tight",
  takeaway: "fill-[#bdccff] text-[17px] font-medium",
};
