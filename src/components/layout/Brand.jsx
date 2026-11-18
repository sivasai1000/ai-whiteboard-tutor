import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }) {
  return (
    <Image
      src="/brand/braynix-mark.png"
      width={32}
      height={32}
      alt=""
      className={cn("size-7 shrink-0 object-contain", className)}
      aria-hidden="true"
      unoptimized
    />
  );
}
