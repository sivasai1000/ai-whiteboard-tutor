import "./globals.css";
import { LessonProvider } from "@/features/library/LessonProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConversationProvider } from "@/features/ai/ConversationProvider";

export const metadata = {
  title: {
    default: "Braynix — A little clarity, on any topic",
    template: "%s · Braynix",
  },
  description:
    "Your ideas, brought to life. Learn any topic through short AI lessons, a visual whiteboard and synchronized narration.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          <LessonProvider>
            <ConversationProvider>
              <AppShell>{children}</AppShell>
            </ConversationProvider>
          </LessonProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
