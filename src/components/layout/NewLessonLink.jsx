"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// A new lesson also resets a draft when the learner is already on the welcome page.
export function NewLessonLink({ onClick, children, ...props }) {
  const pathname = usePathname();
  const router = useRouter();

  function navigate(event) {
    onClick?.(event);
    if (
      pathname === "/" &&
      !event.defaultPrevented &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault();
      router.push(`/?new=${Date.now()}`);
    }
  }

  return (
    <Link href="/" onClick={navigate} {...props}>
      {children}
    </Link>
  );
}
