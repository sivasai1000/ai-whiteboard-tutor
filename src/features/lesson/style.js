export const lessonStyles = {
  workspace:
    "flex min-h-[calc(100dvh-52px)] flex-1 flex-col lg:h-dvh lg:min-h-0",
  toolbar:
    "flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-7",
  toolbarKicker:
    "mb-1.5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
  toolbarTitle:
    "max-w-[48vw] truncate text-sm font-medium tracking-[-0.02em] sm:max-w-none sm:text-base",
  body: "flex min-h-0 flex-1 flex-col xl:flex-row",
  main: "relative flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-4 pt-4 sm:px-6 sm:pt-6 lg:overflow-y-auto",
  fullscreen:
    "h-dvh w-screen overflow-y-auto bg-background px-4 py-4 sm:px-8 sm:py-5",
  sceneHeading: "flex shrink-0 items-start justify-between gap-4 pb-5",
  sceneCount:
    "mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-primary",
  sceneTitle:
    "font-heading text-base font-medium leading-tight tracking-[-0.025em] sm:text-xl",
  boardStage: "relative flex min-h-[440px] flex-1 flex-col sm:min-h-[480px]",
  boardShell:
    "relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_28px_-16px_rgba(30,41,59,0.18)]",
  boardHeader:
    "flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 sm:px-5",
  boardNote:
    "flex min-w-0 items-center gap-2 text-xs font-medium text-slate-600",
  boardMark:
    "flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/7 text-primary",
  boardStep:
    "ml-2 hidden border-l border-slate-200 pl-3 font-mono text-[10px] font-normal tabular-nums text-slate-400 sm:inline",
  boardControls: "flex shrink-0 items-center gap-0.5",
  boardButton:
    "size-11 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:size-8",
  fitButton:
    "h-11 w-11 rounded-lg px-0 font-mono text-[11px] tabular-nums text-slate-500 hover:bg-slate-100 sm:h-8",
  fullscreenButton: "ml-1 border-l border-slate-200 pl-1",
  boardViewport:
    "relative flex min-h-[260px] flex-1 items-center overflow-auto overscroll-contain bg-[radial-gradient(circle,#dfe5ef_0.8px,transparent_0.8px)] [background-size:24px_24px] px-3 py-5 sm:px-7 sm:py-6",
  simulationViewport: "bg-[#0b1222] bg-none px-0 py-0 sm:px-0 sm:py-0",
  diagramFrame: "mx-auto shrink-0",
  diagramFrameFit: "max-w-[1040px]",
  board: "h-full w-full min-w-0 select-none",
  diagramFit: "lg:max-h-[calc(100dvh-360px)] lg:min-h-[240px]",
  diagramFullscreen: "max-h-[calc(100dvh-270px)] min-h-[240px]",
  mediaOverlay: "relative z-20 flex w-full shrink-0 flex-col bg-white",
  caption:
    "flex min-h-16 w-full items-center justify-center px-5 pb-4 pt-2 text-center sm:px-10",
  subtitleStack: "grid w-full place-items-center",
  subtitleMeasure:
    "invisible col-start-1 row-start-1 max-w-[62ch] text-pretty text-[13px] leading-[1.7] sm:text-sm",
  subtitleText:
    "col-start-1 row-start-1 max-w-[62ch] text-pretty text-[13px] leading-[1.7] text-slate-600 empty:hidden sm:text-sm",
  player:
    "flex w-full flex-col border-t border-slate-100 bg-slate-50/65 px-4 pb-3 pt-2 sm:px-5",
  playerControls: "flex min-h-11 items-center gap-2 sm:gap-3",
  playButton:
    "size-11 shrink-0 rounded-full bg-primary text-white shadow-sm shadow-primary/15 hover:bg-primary/90 sm:size-9",
  mediaButton:
    "size-11 shrink-0 rounded-lg text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 sm:size-9",
  mediaTime:
    "ml-1 whitespace-nowrap font-mono text-[11px] tabular-nums text-slate-500",
  speedButton:
    "ml-auto h-11 w-12 rounded-lg px-0 text-[11px] font-medium text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 sm:h-9",
  mediaTimeline:
    "py-2 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-thumb]]:shadow-sm",
  loading:
    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/90 px-6 text-center backdrop-blur-sm",
  error:
    "mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive",
  chat: "flex w-full shrink-0 flex-col border-t border-border xl:w-[330px] xl:border-l xl:border-t-0 2xl:w-[360px]",
};

export const boardColors = {
  violet: "#7950b0",
  cyan: "#246b9a",
  amber: "#956019",
  green: "#286f57",
  // Keep the schema's neutral color name; render it as dark ink on light paper.
  white: "#202938",
  muted: "#606b7d",
};

export const visualizationColors = {
  indigo: { ink: "#4055ce", soft: "#eef1ff" },
  teal: { ink: "#178071", soft: "#e5f5ef" },
  amber: { ink: "#a76d1d", soft: "#fff3dc" },
  rose: { ink: "#b84c74", soft: "#fbeaf1" },
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
