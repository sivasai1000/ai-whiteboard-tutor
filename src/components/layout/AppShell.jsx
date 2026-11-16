"use client";

import { useLessons } from "@/features/library/LessonProvider";
import { AppSidebar } from "./AppSidebar";
import { MobileNavigation } from "./MobileNavigation";
import { layoutStyles as s } from "./style";

export function AppShell({ children }) {
  const { storageError } = useLessons();
  return (
    <div className={s.shell}>
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <aside className={s.desktopSidebar}>
        <AppSidebar />
      </aside>
      <MobileNavigation />
      <main id="main-content" className={s.main}>
        {storageError && (
          <div
            role="alert"
            className="border-b border-amber-400/20 bg-amber-400/5 px-6 py-3 text-xs text-amber-200"
          >
            {storageError}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
