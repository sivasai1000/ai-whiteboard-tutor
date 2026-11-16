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
    <div
      className="mt-9 min-h-0 flex-1 overflow-y-auto"
      aria-label="Conversation history"
    >
      <p className={s.sectionLabel}>Your conversations</p>
      {!ready && (
        <p className="px-3.5 text-xs text-muted-foreground">Loading chats…</p>
      )}
      {ready && !conversations.length && (
        <p className="px-3.5 text-xs leading-6 text-muted-foreground/70">
          A place for your questions.
          <br />
          Your chats will appear here.
        </p>
      )}
      {conversations.map((item) => (
        <Link
          key={item.id}
          href={`/ai?chat=${item.id}`}
          onClick={onNavigate}
          title={item.title}
          aria-current={params.get("chat") === item.id ? "page" : undefined}
          className={cn(
            s.recentItem,
            "min-h-10",
            params.get("chat") === item.id && s.navActive,
          )}
        >
          <MessageSquare className="size-3.5 shrink-0 opacity-60" />
          <span className="truncate">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
