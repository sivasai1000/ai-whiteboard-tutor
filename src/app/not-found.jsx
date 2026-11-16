import { Compass } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Let’s find a clearer path."
      description="This page doesn’t exist. Start a fresh lesson and follow your curiosity."
    />
  );
}
