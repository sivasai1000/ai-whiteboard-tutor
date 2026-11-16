"use client";

import { useState } from "react";
import { Bookmark, History, Search, LoaderCircle } from "lucide-react";
import { useLessons } from "./LessonProvider";
import { LessonList } from "./LessonList";
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
import { libraryStyles as s } from "./style";

export function LessonLibrary({ savedOnly = false }) {
  const { lessons, ready, updateLesson, deleteLesson } = useLessons();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const collection = savedOnly
    ? lessons.filter((lesson) => lesson.saved)
    : lessons;
  const filtered = collection.filter((lesson) =>
    `${lesson.title} ${lesson.topic}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  async function toggleBookmark(lesson) {
    setBusyId(lesson.id);
    setError("");
    try {
      await updateLesson(lesson.id, { saved: !lesson.saved });
    } catch (cause) {
      setError(cause.message || "The bookmark couldn’t be updated.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting || busyId) return;
    setBusyId(deleting.id);
    setError("");
    try {
      await deleteLesson(deleting.id);
      setDeleting(null);
    } catch (cause) {
      setError(cause.message || "The lesson couldn’t be deleted.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={s.page}>
      <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-primary">
        {savedOnly ? (
          <Bookmark className="size-3.5" />
        ) : (
          <History className="size-3.5" />
        )}
        {savedOnly ? "Saved lessons" : "Your history"}
      </p>
      <h1 className={s.heading}>
        {savedOnly
          ? "Good ideas are worth keeping."
          : "Pick up where curiosity left off."}
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {savedOnly
          ? "Your bookmarked explanations, ready for another look."
          : "Every lesson is a little discovery. Revisit yours whenever you like."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Search lessons"
            placeholder="Search your lessons…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 rounded-xl bg-card pl-10 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {collection.length} {collection.length === 1 ? "lesson" : "lessons"} ·
          on this device
        </span>
      </div>
      {error && (
        <div className="mt-5">
          <ErrorState message={error} />
        </div>
      )}
      {!ready ? (
        <div
          role="status"
          className="flex min-h-60 items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-4 animate-spin" />
          Opening your library…
        </div>
      ) : !collection.length ? (
        <EmptyState
          icon={savedOnly ? Bookmark : History}
          title={
            savedOnly
              ? "Keep your first discovery."
              : "Your first discovery is waiting."
          }
          description={
            savedOnly
              ? "Tap the bookmark on any lesson to keep it here. A little clarity, always within reach."
              : "Start with something you’ve always wondered about. Your completed and in-progress lessons will appear here."
          }
        />
      ) : !filtered.length ? (
        <p
          role="status"
          className="py-16 text-center text-sm text-muted-foreground"
        >
          No lessons match “{query}”. Try a different search.
        </p>
      ) : (
        <LessonList
          lessons={filtered}
          onBookmark={toggleBookmark}
          onDelete={setDeleting}
          busyId={busyId}
        />
      )}
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !busyId) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this lesson?</DialogTitle>
            <DialogDescription>
              “{deleting?.title}” and its saved audio will be removed from this
              browser. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={Boolean(busyId)}
              onClick={() => setDeleting(null)}
            >
              Keep lesson
            </Button>
            <Button
              disabled={Boolean(busyId)}
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {busyId ? "Deleting…" : "Delete lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
