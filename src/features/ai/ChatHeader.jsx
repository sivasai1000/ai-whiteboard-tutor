import { Bookmark, MessageSquare, Plus, Trash2, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewChatLink } from "./NewChatLink";
import { aiStyles as s } from "./style";

export function ChatHeader({
  title,
  hasMessages,
  onDelete,
  saved,
  onBookmark,
  bookmarkPending,
}) {
  return (
    <header className={s.header}>
      <div className="flex min-w-0 items-center gap-3">
        <MessageSquare className="size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className={hasMessages ? s.eyebrow : "text-sm font-medium"}>
            AI Chat
          </p>
          {hasMessages && <p className="mt-1 truncate text-[13px]">{title}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!hasMessages && (
          <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Monitor className="size-3.5" />
            Personal workspace
          </span>
        )}
        {hasMessages && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(s.action, saved && "text-primary")}
            disabled={bookmarkPending}
            aria-label={saved ? "Unsave conversation" : "Save conversation"}
            aria-pressed={saved}
            onClick={onBookmark}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </Button>
        )}
        {hasMessages && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={s.action}
                aria-label="Delete conversation"
              >
                <Trash2 className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this conversation?</DialogTitle>
                <DialogDescription>
                  This removes its messages from this browser. This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={onDelete}>
                    Delete chat
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden h-11 text-xs text-muted-foreground sm:inline-flex"
          >
            <NewChatLink>
              <Plus className="size-4" />
              New chat
            </NewChatLink>
          </Button>
        )}
      </div>
    </header>
  );
}
