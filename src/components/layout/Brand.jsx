import { cn } from "@/lib/utils";

export function BrandMark({ className }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      data-brand="look"
      className={cn("size-7 shrink-0 text-primary", className)}
      aria-hidden="true"
    >
      <path d="M50.7 5 43.4 17.2 26.7 27.1v4.3l-7.5 4.7V23.3Z" />
      <path d="M35 28v12.7l-8.3 5v3.3l-7.5 4.4V41.9H13Z" />
      <path d="M45.9 41.1V50L28.6 59H13.1Z" />
    </svg>
  );
}
