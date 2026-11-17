"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Plus, Presentation } from "lucide-react";
import { useLessons } from "@/features/library/LessonProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandMark } from "./Brand";
import { NewLessonLink } from "./NewLessonLink";
import { NewChatLink } from "@/features/ai/NewChatLink";
import { ConversationHistory } from "@/features/ai/ConversationHistory";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { layoutStyles as s } from "./style";

export function AppSidebar({ onNavigate }) {
  const pathname = usePathname();
  const isChat = pathname === "/ai";
  const NewLink = isChat ? NewChatLink : NewLessonLink;
  const { lessons, ready } = useLessons();
  const recent = lessons.slice(0, 5);

  return (
    <div className={s.sidebar}>
      <Link
        href="/"
        onClick={onNavigate}
        className={s.brand}
        aria-label="Braynix home"
      >
        <BrandMark /> Braynix
      </Link>
      <WorkspaceSwitcher isChat={isChat} onNavigate={onNavigate} />
      <Button asChild className={s.newLesson}>
        <NewLink
          onClick={onNavigate}
          aria-label={isChat ? "Start a new chat" : undefined}
        >
          <Plus className="size-4 text-primary" />
          {isChat ? "New chat" : "New lesson"}
        </NewLink>
      </Button>
      <Suspense fallback={<div className="h-24" />}>
        <WorkspaceNavigation isChat={isChat} onNavigate={onNavigate} />
      </Suspense>
      {isChat ? (
        <Suspense
          fallback={
            <p className="mt-6 px-3 text-xs text-muted-foreground">
              Loading conversations…
            </p>
          }
        >
          <ConversationHistory onNavigate={onNavigate} />
        </Suspense>
      ) : (
        <div className={s.recents}>
          <p className={s.sectionLabel}>Recent lessons</p>
          {ready && !recent.length && (
            <p className={s.sidebarEmpty}>
              Your recent whiteboard lessons will appear here.
            </p>
          )}
          {!ready && (
            <div className="mx-3.5 h-7 animate-pulse rounded bg-muted" />
          )}
          {recent.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              onClick={onNavigate}
              className={cn(
                s.recentItem,
                pathname === `/lesson/${lesson.id}` &&
                  "bg-accent text-foreground",
              )}
            >
              <Presentation className="size-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{lesson.title}</span>
            </Link>
          ))}
        </div>
      )}
      <footer className={s.footer}>
        <div className={s.credit}>
          <p className={s.creditLabel}>
            Made by <span className={s.creditName}>Sivasai</span>
          </p>
          <a
            href="mailto:sivasaimallipudi9h@gmail.com"
            className={s.creditLink}
          >
            sivasaimallipudi9h@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
