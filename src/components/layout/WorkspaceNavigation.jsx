"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, Compass, History } from "lucide-react";
import { useConversations } from "@/features/ai/ConversationProvider";
import { useLessons } from "@/features/library/LessonProvider";
import { cn } from "@/lib/utils";
import { layoutStyles as s } from "./style";

export function WorkspaceNavigation({ isChat, onNavigate }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { conversations } = useConversations();
  const { lessons } = useLessons();
  const items = isChat
    ? [
        {
          href: "/ai?view=history",
          label: "History",
          icon: History,
          active: params.get("view") === "history",
          count: conversations.length,
        },
        {
          href: "/ai?view=saved",
          label: "Saved chats",
          icon: Bookmark,
          active: params.get("view") === "saved",
          count: conversations.filter((item) => item.saved).length,
        },
      ]
    : [
        { href: "/explore", label: "Explore topics", icon: Compass },
        {
          href: "/history",
          label: "History",
          icon: History,
          count: lessons.length,
        },
        {
          href: "/saved",
          label: "Saved lessons",
          icon: Bookmark,
          count: lessons.filter((item) => item.saved).length,
        },
      ];
  return (
    <nav
      className={s.navigation}
      aria-label={isChat ? "Chat navigation" : "Lesson navigation"}
    >
      {items.map(({ href, label, icon: Icon, active, count }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-label={label}
          aria-current={(active ?? pathname === href) ? "page" : undefined}
          className={cn(
            s.navItem,
            (active ?? pathname === href) && s.navActive,
          )}
        >
          <Icon className="size-[18px] shrink-0" strokeWidth={1.6} />
          <span className="flex-1">{label}</span>
          {count > 0 && (
            <span className={s.navCount} aria-hidden="true">
              {count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
