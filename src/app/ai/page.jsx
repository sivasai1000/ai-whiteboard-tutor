import { Suspense } from "react";
import { AiWorkspace } from "@/features/ai/AiWorkspace";

export const metadata = { title: "AI chat" };

export default function AiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground" role="status">
          Opening your conversations…
        </div>
      }
    >
      <AiWorkspace />
    </Suspense>
  );
}
