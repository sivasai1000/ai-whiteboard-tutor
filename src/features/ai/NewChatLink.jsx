"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function NewChatLink({ onClick, ...props }) {
  const router = useRouter();
  return (
    <Link
      {...props}
      href="/ai"
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        router.push(`/ai?new=${crypto.randomUUID()}`);
      }}
    />
  );
}
