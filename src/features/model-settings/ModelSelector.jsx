"use client";

import { useRef, useState } from "react";
import { ChevronDown, LockKeyhole } from "lucide-react";
import { InputGroupButton } from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { modelCatalog, modelLabel } from "@/lib/model-settings";
import { ModelAccessDialog } from "./ModelAccessDialog";
import { modelControlStyles as s } from "./style";

export function ModelSelector({ model, disabled }) {
  const trigger = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [requestedModel, setRequestedModel] = useState(null);
  const lockedModels = modelCatalog.filter((option) => option.id !== model);

  function requestAccess(option) {
    setRequestedModel(option);
    setMenuOpen(false);
    setAccessOpen(true);
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <InputGroupButton
            ref={trigger}
            className={s.trigger}
            disabled={disabled}
            aria-label={`Model: ${modelLabel(model)}`}
          >
            <span className="max-w-[130px] truncate">{modelLabel(model)}</span>{" "}
            <ChevronDown />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          collisionPadding={12}
          className={s.modelMenu}
          onCloseAutoFocus={(event) => {
            if (accessOpen) event.preventDefault();
          }}
        >
          <DropdownMenuLabel className={s.menuLabel}>
            Models · OpenAI
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={model}>
            <DropdownMenuRadioItem value={model} className={s.item}>
              <div className="flex-1">
                <p className="font-medium">{modelLabel(model)}</p>
              </div>
              <span className={s.activeBadge}>Active</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <div className={s.divider} role="separator" />
          <DropdownMenuLabel className={s.menuLabel}>
            Contact for access
          </DropdownMenuLabel>
          {lockedModels.map((option) => (
            // Locked for selection, but an accessible action still opens contact details.
            <DropdownMenuItem
              key={option.id}
              className={s.lockedItem}
              aria-label={`${option.label}, locked. Contact for access`}
              onSelect={() => requestAccess(option)}
            >
              <LockKeyhole className={s.lockIcon} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p>{option.label}</p>
              </div>
              <span className={s.lockedBadge}>Locked</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ModelAccessDialog
        model={requestedModel}
        open={accessOpen}
        onOpenChange={setAccessOpen}
        returnFocusRef={trigger}
      />
    </>
  );
}
