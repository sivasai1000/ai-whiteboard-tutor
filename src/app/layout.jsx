import "./globals.css";
import { LessonProvider } from "@/features/library/LessonProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: {
    default: "Luma — A little clarity, on any topic",
    template: "%s · Luma",
  },
  description:
    "Your ideas, brought to life. Learn any topic through short AI lessons, a visual whiteboard and synchronized narration.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <TooltipProvider>
          <LessonProvider>
            <AppShell>{children}</AppShell>
          </LessonProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
