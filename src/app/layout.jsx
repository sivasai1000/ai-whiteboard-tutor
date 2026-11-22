import "./globals.css";
import { LessonProvider } from "@/features/library/LessonProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConversationProvider } from "@/features/ai/ConversationProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata = {
  title: {
    default: "Look — A little clarity, on any topic",
    template: "%s · Look",
  },
  description:
    "Your ideas, brought to life. Learn any topic through short AI lessons, a visual whiteboard and synchronized narration.",
  applicationName: "Look",
  icons: {
    icon: { url: "/brand/look-mark.svg", type: "image/svg+xml" },
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem('look-theme')}catch(e){}document.documentElement.classList.toggle('dark',t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <LessonProvider>
              <ConversationProvider>
                <AppShell>{children}</AppShell>
              </ConversationProvider>
            </LessonProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
