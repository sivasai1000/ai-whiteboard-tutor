export const modelControlStyles = {
  group: "flex flex-wrap items-center gap-1",
  trigger:
    "h-9 gap-1.5 rounded-md px-2 text-xs font-normal text-foreground hover:bg-secondary [&_svg]:size-3",
  menu: "w-64 rounded-xl border-border bg-popover p-1.5",
  modelMenu:
    "w-72 max-w-[calc(100vw-2rem)] rounded-xl border-border bg-popover p-1.5 shadow-lg",
  menuLabel: "px-2 py-2 text-[11px] font-medium text-muted-foreground",
  divider: "mx-2 my-1 h-px bg-border",
  activeBadge:
    "ml-2 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary",
  lockedItem:
    "min-h-14 cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-muted-foreground focus:bg-secondary focus:text-foreground",
  lockIcon: "size-3.5 text-muted-foreground",
  lockedBadge: "ml-1 text-[10px] text-muted-foreground",
  item: "min-h-11 rounded-lg py-2",
  description: "mt-0.5 text-[11px] leading-4 text-muted-foreground",
};

export const modelAccessStyles = {
  dialog:
    "gap-5 rounded-2xl border-border bg-popover p-6 shadow-xl sm:max-w-[420px]",
  header: "gap-3 text-left",
  icon: "mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary",
  title: "text-xl font-semibold tracking-tight",
  description: "text-[13px] leading-relaxed text-muted-foreground",
  modelName: "font-medium text-foreground",
  contact:
    "flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4",
  contactIcon: "size-4 shrink-0 text-muted-foreground",
  contactName: "text-sm font-medium text-foreground",
  email: "mt-1 select-text break-all text-xs leading-5 text-muted-foreground",
  footer: "gap-2 pt-1",
  button: "h-11 rounded-lg px-4 text-[13px]",
};
