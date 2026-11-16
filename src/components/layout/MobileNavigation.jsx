"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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
import { NewChatLink } from "@/features/ai/NewChatLink";
import { layoutStyles as s } from "./style";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const isChat = usePathname() === "/ai";
  const NewLink = isChat ? NewChatLink : NewLessonLink;
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
        <NewLink aria-label={isChat ? "New chat" : "New lesson"}>
          <Plus className="size-5" />
        </NewLink>
      </Button>
    </header>
  );
}
