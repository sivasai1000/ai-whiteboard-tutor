import { MessageSquare, Plus, Trash2 } from "lucide-react";
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

export function ChatHeader({ title, hasMessages, onDelete }) {
  return (
    <header className={s.header}>
      <div className="flex min-w-0 items-center gap-3">
        <MessageSquare className="size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className={s.eyebrow}>AI chat</p>
          <p className="mt-1 truncate text-[13px]">
            {hasMessages ? title : "A fresh conversation"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
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
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs text-muted-foreground"
        >
          <NewChatLink>
            <Plus className="size-4" />
            New chat
          </NewChatLink>
        </Button>
      </div>
    </header>
  );
}
