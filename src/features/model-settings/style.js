export const modelControlStyles = {
  group: "flex min-w-0 flex-nowrap items-center gap-0.5",
  trigger:
    "h-10 min-w-0 shrink gap-1.5 rounded-lg px-2 text-xs font-medium text-foreground hover:bg-secondary [&_svg]:size-3 [&_svg]:shrink-0",
  settingsTrigger:
    "h-10 shrink-0 gap-2 rounded-lg px-3 text-xs font-normal text-muted-foreground hover:bg-secondary [&_svg]:size-3.5",
  menu: "w-60 max-w-[calc(100vw-1.5rem)] rounded-xl border-border bg-popover p-1 shadow-lg",
  settingsLabel: "px-2 py-1 text-[10px] font-medium leading-4 text-muted-foreground",
  settingsItem:
    "min-h-10 gap-2 whitespace-nowrap rounded-md py-1.5 text-xs sm:min-h-9",
  effortLabel: "w-12 shrink-0 font-medium",
  effortDescription: "text-[11px] leading-4 text-muted-foreground",
  modelMenu:
    "w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border-border bg-popover p-1.5 shadow-lg",
  menuLabel: "px-2 py-1.5 text-[10px] font-medium text-muted-foreground",
  divider: "mx-2 my-1 h-px bg-border",
  activeBadge: "ml-2 text-[10px] font-medium text-primary",
  lockedItem:
    "min-h-11 cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-xs text-muted-foreground focus:bg-secondary focus:text-foreground",
  lockIcon: "size-3 text-muted-foreground/70",
  lockedBadge: "ml-1 text-[10px] text-muted-foreground/75",
  item: "min-h-11 whitespace-nowrap rounded-lg py-2 text-xs",
};

export const modelAccessStyles = {
  dialog:
    "gap-4 rounded-2xl border-border bg-popover p-5 shadow-xl sm:max-w-[380px] sm:p-6",
  header: "gap-2 text-left",
  icon: "mb-1 flex size-9 items-center justify-center rounded-xl bg-secondary text-primary",
  title: "text-lg font-medium tracking-tight",
  description: "text-[13px] leading-relaxed text-muted-foreground",
  modelName: "font-medium text-foreground",
  contact: "flex items-center gap-3 rounded-xl bg-secondary/60 p-3",
  contactIcon: "size-4 shrink-0 text-muted-foreground",
  contactName: "text-[13px] font-medium",
  email: "mt-0.5 select-text break-all text-xs leading-5 text-muted-foreground",
  footer: "gap-2 pt-1",
  button: "h-10 rounded-lg px-4 text-xs",
};
