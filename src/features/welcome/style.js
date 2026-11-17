export const welcomeStyles = {
  screen: "relative flex min-h-full flex-col px-5 pb-6 sm:px-10 lg:px-12",
  topbar:
    "flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/70",
  content:
    "mx-auto flex w-full max-w-[720px] flex-1 flex-col items-start pb-8 pt-10 text-left sm:pt-14 lg:pt-16",
  eyebrow: "text-[11px] font-medium tracking-[0.16em] text-primary",
  heading:
    "mt-4 font-heading text-[30px] font-semibold leading-[1.2] tracking-[-0.035em] sm:text-[38px]",
  intro: "mt-4 max-w-xl text-sm leading-6 text-muted-foreground",
  form: "mt-8 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/[0.035] transition-colors",
  textarea:
    "min-h-24 resize-none rounded-none border-0 bg-transparent px-5 py-5 text-base shadow-none placeholder:text-muted-foreground sm:text-[15px]",
  formFooter:
    "flex flex-wrap items-center justify-between gap-3 px-4 pb-4 sm:px-5",
  submit: "h-11 gap-2 rounded-lg px-3.5 text-[13px] font-medium",
  suggestion:
    "inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary/40 px-3 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground disabled:pointer-events-none disabled:opacity-50",
};

export const samplePreviewStyles = {
  card: "group mt-8 flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-muted-foreground disabled:pointer-events-none disabled:opacity-50 sm:flex-row sm:items-center sm:gap-6",
  art: "relative flex w-full shrink-0 items-center overflow-hidden rounded-lg bg-slate-900 sm:w-[260px]",
  thumbnail: "block h-auto w-full",
  play: "absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-white/15 text-white",
  content: "flex min-w-0 flex-1 flex-col px-2 pb-2 sm:py-3 sm:pl-0 sm:pr-3",
  eyebrow:
    "flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.08em] text-muted-foreground",
  title:
    "mt-2 text-base font-semibold leading-6 tracking-tight text-foreground",
  description: "mt-1 text-xs leading-5 text-muted-foreground",
  action: "mt-4 flex items-center gap-2 text-xs font-medium text-primary",
};

export const exploreStyles = {
  page: "mx-auto w-full max-w-6xl px-6 py-9 sm:px-10 lg:px-12 lg:py-11",
  heading:
    "mt-4 font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl",
  filters: "mt-9 flex flex-wrap gap-2 border-b border-border pb-6",
  topic:
    "group flex min-h-44 flex-col border-b border-border/65 py-6 transition-colors",
};
