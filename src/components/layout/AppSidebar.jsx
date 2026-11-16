"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Compass,
  History,
  Plus,
  ArrowUpRight,
  MessageCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { useLessons } from "@/features/library/LessonProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BrandMark } from "./Brand";
import { NewLessonLink } from "./NewLessonLink";
import { NewChatLink } from "@/features/ai/NewChatLink";
import { ConversationHistory } from "@/features/ai/ConversationHistory";
import { layoutStyles as s } from "./style";

const navigation = [
  { href: "/ai", label: "AI chat", icon: Sparkles },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/history", label: "History", icon: History },
  { href: "/saved", label: "Saved lessons", icon: Bookmark },
];

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
        aria-label="Luma home"
      >
        <BrandMark /> luma
        <span className="ml-1 rounded border border-border px-1.5 py-0.5 text-[8px] font-medium tracking-wider text-muted-foreground">
          BETA
        </span>
      </Link>
      <Button asChild className={s.newLesson}>
        <NewLink onClick={onNavigate}>
          <Plus className="size-4" />
          {isChat ? "New chat" : "New lesson"}
          <span className="ml-auto text-[11px] text-primary/60">↗</span>
        </NewLink>
      </Button>
      <nav className={s.navigation} aria-label="Main navigation">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(s.navItem, pathname === href && s.navActive)}
          >
            <Icon className="size-[17px]" strokeWidth={1.6} />
            {label}
            {href === "/saved" && lessons.some((lesson) => lesson.saved) && (
              <span className="ml-auto text-[11px] tabular-nums">
                {lessons.filter((lesson) => lesson.saved).length}
              </span>
            )}
          </Link>
        ))}
      </nav>
      {isChat ? (
        <Suspense
          fallback={
            <p className="mt-9 px-3 text-xs text-muted-foreground">
              Loading conversations…
            </p>
          }
        >
          <ConversationHistory onNavigate={onNavigate} />
        </Suspense>
      ) : (
        <div className="mt-10 min-h-0 overflow-y-auto">
          <p className={s.sectionLabel}>
            Recent topics
            <span className="size-1 rounded-full bg-muted-foreground/50" />
          </p>
          {ready && !recent.length && (
            <p className="px-3.5 text-[12px] leading-relaxed text-muted-foreground/60">
              A fresh page. Your lessons
              <br />
              will appear here.
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
              <MessageCircle className="size-3.5 shrink-0 opacity-50" />
              <span className="truncate">{lesson.title}</span>
            </Link>
          ))}
        </div>
      )}
      <div className={s.footer}>
        {!isChat && (
          <div className={s.footerCard}>
            <Sparkles className="mb-3 size-4 text-primary" />
            <p className="text-xs font-medium">Follow your curiosity.</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Big ideas, made a little clearer.
              <br />
              One lesson at a time.
            </p>
            <Link
              href="/explore"
              onClick={onNavigate}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80"
            >
              Find something new <ArrowUpRight className="size-3" />
            </Link>
          </div>
        )}
        <div className={s.profile}>
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-muted-foreground">
            Y
          </div>
          <div>
            <p className="text-[11px] font-medium">Personal workspace</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Saved on this device
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="ml-auto size-7 text-muted-foreground"
                aria-label="About Luma"
              >
                <Info className="size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>A little clarity, on any topic.</DialogTitle>
                <DialogDescription>
                  Luma combines short explanations, spoken narration and a
                  visual whiteboard to make learning feel natural.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  New lessons and follow-up answers are generated by AI.
                  Narration uses a synthetic voice. AI can make mistakes, so
                  check important information.
                </p>
                <p>
                  Your lesson history, bookmarks and downloaded narration are
                  stored in this browser. Clearing browser data removes them.
                </p>
                <p>
                  The preview is a prewritten sample, clearly labelled
                  throughout. Generating a new lesson requires the server’s
                  OpenAI connection.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
