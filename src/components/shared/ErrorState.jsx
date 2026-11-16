import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0">
        <p className="leading-relaxed text-foreground/85">{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-8 px-0"
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
