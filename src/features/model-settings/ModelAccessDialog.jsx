"use client";

import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { modelAccessContact } from "@/lib/model-settings";
import { modelAccessStyles as s } from "./style";

export function ModelAccessDialog({
  model,
  open,
  onOpenChange,
  returnFocusRef,
}) {
  const { name, email } = modelAccessContact;
  const subject = encodeURIComponent(
    `Look · Access to ${model?.label || "an AI model"}`,
  );
  const body = encodeURIComponent(
    `Hi ${name},\n\nI'd like to request access to ${model?.label || "another AI model"} in Look.\n\nThank you.`,
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={s.dialog}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <DialogHeader className={s.header}>
          <div className={s.icon}>
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle className={s.title}>Request model access</DialogTitle>
          <DialogDescription className={s.description}>
            <span className={s.modelName}>{model?.label}</span> isn’t enabled in
            this workspace. Contact {name} to ask about access.
          </DialogDescription>
        </DialogHeader>
        <div className={s.contact}>
          <Mail className={s.contactIcon} aria-hidden="true" />
          <div className="min-w-0">
            <p className={s.contactName}>{name}</p>
            <p className={s.email}>{email}</p>
          </div>
        </div>
        <DialogFooter className={s.footer}>
          <DialogClose asChild>
            <Button type="button" variant="ghost" className={s.button}>
              Not now
            </Button>
          </DialogClose>
          <Button asChild className={s.button}>
            <a href={`mailto:${email}?subject=${subject}&body=${body}`}>
              <Mail className="size-4" aria-hidden="true" /> Email {name}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
