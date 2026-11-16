export const layoutStyles = {
  shell:
    "flex min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden",
  desktopSidebar:
    "hidden w-60 shrink-0 border-r border-border/70 bg-card/40 lg:flex lg:flex-col",
  sidebar: "flex h-full min-h-0 flex-col px-4 pb-5 pt-7",
  brand:
    "flex items-center gap-2.5 px-3 text-[23px] font-semibold tracking-[-0.06em]",
  newLesson:
    "mt-9 h-11 w-full justify-start gap-2.5 rounded-xl border border-primary/20 bg-primary/10 px-3.5 text-[13px] font-medium text-primary hover:bg-primary/15",
  navigation: "mt-5 flex flex-col gap-1",
  navItem:
    "flex min-h-10 items-center gap-3 rounded-lg px-3.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
  navActive: "bg-accent text-foreground",
  sectionLabel:
    "mb-3 flex items-center justify-between px-3.5 text-[10px] font-medium uppercase tracking-[0.13em] text-muted-foreground/65",
  recentItem:
    "flex min-h-9 items-center gap-2.5 rounded-lg px-3.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
  footer: "mt-auto pt-6",
  footerCard:
    "mx-1 mb-5 rounded-xl border border-border/80 bg-background/30 px-3.5 py-4",
  profile: "flex items-center gap-2.5 border-t border-border/70 px-2 pt-4",
  main: "min-w-0 flex-1 pt-16 lg:min-h-0 lg:overflow-y-auto lg:pt-0",
  mobileHeader:
    "fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur-md lg:hidden",
  drawer: "w-72 border-border bg-card p-0",
  page: "mx-auto w-full max-w-6xl px-6 py-8 sm:px-10 lg:px-12 lg:py-10",
  eyebrow:
    "text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
};
