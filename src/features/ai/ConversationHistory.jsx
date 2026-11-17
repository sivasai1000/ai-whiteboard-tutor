"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { layoutStyles as s } from "@/components/layout/style";
import { useConversations } from "./ConversationProvider";

export function ConversationHistory({ onNavigate }) {
  const params = useSearchParams();
  const { conversations, ready } = useConversations();
  return (
    <div className={s.recents} aria-label="Conversation history">
      <p className={s.sectionLabel}>Recent chats</p>
      {!ready && (
        <p className="px-3.5 text-xs text-muted-foreground">Loading chats…</p>
      )}
      {ready && !conversations.length && (
        <p className={s.sidebarEmpty}>
          Start a conversation. Your recent chats will appear here.
        </p>
      )}
      {conversations.slice(0, 10).map((item) => (
        <Link
          key={item.id}
          href={`/ai?chat=${item.id}`}
          onClick={onNavigate}
          title={item.title}
          aria-current={
            !params.has("view") && params.get("chat") === item.id
              ? "page"
              : undefined
          }
          className={cn(
            s.recentItem,
            !params.has("view") &&
              params.get("chat") === item.id &&
              s.navActive,
          )}
        >
          <MessageSquare className="size-4 shrink-0" strokeWidth={1.5} />
          <span className="truncate">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
