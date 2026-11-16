"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";
import { BrandMark } from "./Brand";
import { NewLessonLink } from "./NewLessonLink";
import { layoutStyles as s } from "./style";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className={s.mobileHeader}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className={s.drawer}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse topics and reopen your lessons.
          </SheetDescription>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-semibold tracking-tight"
      >
        <BrandMark className="size-6" />
        luma
      </Link>
      <Button asChild size="icon" variant="ghost">
        <NewLessonLink aria-label="New lesson">
          <Plus className="size-5" />
        </NewLessonLink>
      </Button>
    </header>
  );
}
