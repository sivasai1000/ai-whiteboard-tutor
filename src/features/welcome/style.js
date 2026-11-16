export const welcomeStyles = {
  screen: "relative flex min-h-full flex-col px-6 pb-8 sm:px-10 lg:px-12",
  topbar:
    "flex h-20 shrink-0 items-center justify-between gap-4 border-b border-border/45",
  content:
    "mx-auto flex w-full max-w-[750px] flex-1 flex-col items-center pb-8 pt-10 text-center sm:pt-12 xl:pt-14",
  eyebrow:
    "mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80",
  heading:
    "mt-5 text-[38px] leading-[1.14] font-medium tracking-[-0.055em] sm:text-[52px] xl:text-[58px]",
  intro: "mt-5 max-w-md text-[13px] leading-6 text-muted-foreground sm:text-sm",
  form: "mt-9 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/10 transition-colors focus-within:border-primary/45",
  textarea:
    "min-h-24 resize-none rounded-none border-0 bg-transparent px-5 py-5 text-sm shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 sm:min-h-28 sm:px-6 sm:text-[15px]",
  formFooter:
    "flex flex-wrap items-center justify-between gap-3 px-4 pb-4 sm:px-5",
  levelButton: "h-7 rounded-md px-2 text-[10px] font-normal sm:text-[11px]",
  submit: "h-9 gap-2 rounded-lg px-3.5 text-xs font-medium",
  suggestion:
    "inline-flex min-h-9 items-center gap-2 rounded-lg border border-border/70 bg-card/30 px-3 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 sm:text-xs",
  sample:
    "group mt-9 flex w-full items-center gap-4 rounded-xl border border-border/65 bg-card/30 p-3 text-left transition-colors hover:border-primary/30 hover:bg-card/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 sm:gap-5 sm:p-3.5",
  footer:
    "flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-muted-foreground/55",
};

export const exploreStyles = {
  page: "mx-auto w-full max-w-6xl px-6 py-9 sm:px-10 lg:px-12 lg:py-11",
  heading: "mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl",
  filters: "mt-9 flex flex-wrap gap-2 border-b border-border pb-6",
  topic:
    "group flex min-h-44 flex-col border-b border-border/65 py-6 transition-colors",
};
