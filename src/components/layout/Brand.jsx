import { cn } from "@/lib/utils";

export function BrandMark({ className }) {
  return (
    <svg
      className={cn("size-7 text-primary", className)}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 3.5 19.3 12.7 28.5 16 19.3 19.3 16 28.5 12.7 19.3 3.5 16 12.7 12.7Z"
        fill="currentColor"
      />
      <path
        d="m25 3 1.1 3.1L29.2 7.2l-3.1 1.1L25 11.4l-1.1-3.1-3.1-1.1 3.1-1.1Z"
        fill="currentColor"
        opacity=".45"
      />
    </svg>
  );
}
