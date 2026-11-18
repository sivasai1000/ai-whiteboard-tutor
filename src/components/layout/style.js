export const layoutStyles = {
  shell:
    "flex min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden",
  desktopSidebar:
    "hidden w-[240px] shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col",
  sidebar: "flex h-full min-h-0 flex-col px-4 pb-4 pt-5",
  brand:
    "flex shrink-0 items-center gap-2.5 px-2 font-heading text-xl font-semibold tracking-[-0.035em]",
  workspaceSwitcher:
    "mt-6 grid shrink-0 grid-cols-2 rounded-lg bg-secondary p-1",
  workspaceTab:
    "flex min-h-9 min-w-0 items-center justify-center rounded-md px-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground",
  workspaceTabActive: "bg-card text-foreground shadow-xs",
  workspaceTabLabel:
    "flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium",
  newLesson:
    "mt-4 h-10 w-full shrink-0 justify-start gap-3 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-none hover:bg-secondary",
  navigation: "mt-3 flex shrink-0 flex-col gap-1",
  navItem:
    "flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-muted-foreground",
  navActive: "bg-primary/10 text-primary",
  navCount:
    "min-w-5 rounded px-1 text-center text-xs tabular-nums text-muted-foreground",
  recents: "mt-6 min-h-0 flex-1 overflow-y-auto border-t border-border pt-6",
  sectionLabel:
    "mb-3 flex items-center justify-between px-3 text-xs font-medium text-muted-foreground",
  recentItem:
    "flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-muted-foreground",
  sidebarEmpty: "px-3 text-xs leading-6 text-muted-foreground",
  footer: "mt-auto shrink-0 pt-5",
  credit: "border-t border-border px-2 pt-4",
  creditLabel: "text-xs text-muted-foreground",
  creditName: "font-medium text-foreground",
  creditLink:
    "-ml-1 mt-1 flex min-h-10 w-fit max-w-full items-center rounded px-1 text-[11px] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground",
  main: "min-w-0 flex-1 pt-[3.25rem] lg:min-h-0 lg:overflow-y-auto lg:pt-0",
  mobileHeader:
    "fixed inset-x-0 top-0 z-40 flex h-[3.25rem] items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-md lg:hidden",
  drawer: "w-[272px] max-w-[88vw] border-border bg-sidebar p-0",
};
