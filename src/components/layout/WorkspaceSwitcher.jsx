"use client";

import Link from "next/link";
import { MessageSquare, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { layoutStyles as s } from "./style";

const workspaces = [
  {
    href: "/ai",
    label: "AI Chat",
    icon: MessageSquare,
    chat: true,
  },
  {
    href: "/",
    label: "Whiteboard",
    icon: Presentation,
    chat: false,
  },
];

export function WorkspaceSwitcher({ isChat, onNavigate }) {
  return (
    <nav className={s.workspaceSwitcher} aria-label="Choose workspace">
      {workspaces.map(({ href, label, icon: Icon, chat }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-label={chat ? "AI chat" : "Whiteboard lessons"}
          aria-current={isChat === chat ? "page" : undefined}
          className={cn(
            s.workspaceTab,
            isChat === chat && s.workspaceTabActive,
          )}
        >
          <span className={s.workspaceTabLabel}>
            <Icon className="size-4 shrink-0" strokeWidth={1.7} />
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
