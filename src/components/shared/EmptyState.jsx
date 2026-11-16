import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel = "Create a lesson",
  href = "/",
}) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-border bg-card">
        <Icon className="size-6 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-medium tracking-tight">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-7">
        <Link href={href}>
          <Plus className="size-4" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  );
}
