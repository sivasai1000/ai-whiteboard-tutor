/** Shared dimensions keep the chat and whiteboard composers equally compact. */
export const composerStyles = {
  shell:
    "w-full min-w-0 overflow-hidden rounded-2xl border-border bg-card shadow-[0_2px_12px_-6px_rgba(24,24,27,0.12)]",
  textarea:
    "min-h-[76px] max-h-[min(14rem,35dvh)] w-full min-w-0 resize-none overflow-y-auto rounded-none border-0 bg-transparent px-4 pb-2 pt-4 text-base leading-6 shadow-none placeholder:text-muted-foreground/80 sm:min-h-[84px] sm:px-5 sm:text-[15px]",
  footer:
    "w-full min-w-0 flex-nowrap justify-between gap-2 px-2 pb-2 sm:px-3 sm:pb-3",
  actions: "ml-auto flex shrink-0 items-center gap-2",
  send: "size-10 shrink-0 rounded-xl p-0 text-[13px] shadow-none sm:h-10 sm:w-auto sm:px-4",
  iconSend: "size-10 shrink-0 rounded-xl p-0 shadow-none",
  hint: "hidden text-[11px] font-normal text-muted-foreground/75 xl:inline",
};
