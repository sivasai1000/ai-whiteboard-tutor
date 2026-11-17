"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  History,
  MessageSquare,
  Search,
  Trash2,
  Plus,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { cn } from "@/lib/utils";
import { useConversations } from "./ConversationProvider";
import { NewChatLink } from "./NewChatLink";
import { aiStyles as s } from "./style";

function messageText(message) {
  return (
    message?.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ") || ""
  );
}

export function ConversationLibrary({ savedOnly = false }) {
  const { conversations, ready, storageError, setSaved, remove } =
    useConversations();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const collection = savedOnly
    ? conversations.filter((item) => item.saved)
    : conversations;
  const filtered = collection.filter((item) =>
    `${item.title} ${item.messages.map(messageText).join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  async function bookmark(item) {
    setPending(item.id);
    setError("");
    try {
      await setSaved(item.id, !item.saved);
    } catch {
      setError("The bookmark could not be saved. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function confirmDelete() {
    if (!deleting || pending) return;
    setPending(deleting.id);
    setError("");
    try {
      await remove(deleting.id);
      setDeleting(null);
    } catch {
      setError("This conversation could not be deleted. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section
      className={s.libraryPage}
      aria-label={savedOnly ? "Saved chats" : "Chat history"}
    >
      <div className={s.libraryHeadingRow}>
        <div>
          <p className={s.libraryEyebrow}>AI Chat / Your library</p>
          <h1 className={s.libraryHeading}>
            {savedOnly ? "Saved chats" : "Chat history"}
          </h1>
          <p className={s.libraryDescription}>
            {savedOnly
              ? "The conversations you want to come back to."
              : "Pick up a thought, find an answer, or keep exploring."}
          </p>
        </div>
        <Button asChild className="h-11 shrink-0 rounded-lg px-4">
          <NewChatLink>
            <Plus className="size-4" />
            New chat
          </NewChatLink>
        </Button>
      </div>
      <div className={s.libraryToolbar}>
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Search chats"
            placeholder="Search titles and messages…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={s.librarySearch}
          />
        </div>
        <p
          className="shrink-0 text-xs text-muted-foreground"
          aria-live="polite"
        >
          {filtered.length}{" "}
          {filtered.length === 1 ? "conversation" : "conversations"}
        </p>
      </div>
      {(error || storageError) && (
        <div className="mt-5">
          <ErrorState message={error || storageError} />
        </div>
      )}
      {!ready ? (
        <div
          role="status"
          className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-4 animate-spin" />
          Opening your chats…
        </div>
      ) : !collection.length ? (
        <EmptyState
          icon={savedOnly ? Bookmark : History}
          title={
            savedOnly ? "Keep a good conversation." : "Your ideas start here."
          }
          description={
            savedOnly
              ? "Use the bookmark in a conversation to save it here. Your lesson bookmarks stay in Whiteboard."
              : "Your conversations will appear here automatically. Start with a question or an idea."
          }
          actionLabel="Start a chat"
          href="/ai"
        />
      ) : !filtered.length ? (
        <div role="status" className="py-20 text-center">
          <p className="text-sm text-muted-foreground">
            No chats match “{query}”.
          </p>
          <Button variant="ghost" className="mt-3" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <ul className={s.libraryList}>
          {filtered.map((item) => (
            <li key={item.id} className={s.libraryRow}>
              <MessageSquare
                className="mt-1 hidden size-5 shrink-0 text-muted-foreground sm:block"
                strokeWidth={1.5}
              />
              <Link href={`/ai?chat=${item.id}`} className={s.libraryLink}>
                <h2 className={s.libraryTitle}>{item.title}</h2>
                <p className={s.libraryPreview}>
                  {messageText(item.messages.at(-1)) ||
                    "Open this conversation"}
                </p>
                <p className={s.libraryMeta}>
                  {new Date(item.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  <span aria-hidden="true"> · </span>
                  {item.messages.length} messages
                </p>
              </Link>
              <div className="flex shrink-0 items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(s.action, item.saved && "text-primary")}
                  disabled={pending === item.id}
                  aria-label={`${item.saved ? "Unsave" : "Save"} ${item.title}`}
                  aria-pressed={Boolean(item.saved)}
                  onClick={() => bookmark(item)}
                >
                  <Bookmark
                    className={cn("size-4", item.saved && "fill-current")}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(s.action, "hover:text-destructive")}
                  disabled={pending === item.id}
                  aria-label={`Delete ${item.title}`}
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !pending) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this conversation?</DialogTitle>
            <DialogDescription>
              “{deleting?.title}” and its messages will be removed from this
              browser. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={Boolean(pending)}
              onClick={() => setDeleting(null)}
            >
              Keep chat
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(pending)}
              onClick={confirmDelete}
            >
              {pending ? "Deleting…" : "Delete chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
