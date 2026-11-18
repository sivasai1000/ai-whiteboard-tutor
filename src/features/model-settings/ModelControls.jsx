"use client";

import { SlidersHorizontal } from "lucide-react";
import { InputGroupButton } from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { reasoningEfforts } from "@/lib/model-settings";
import { ModelSelector } from "./ModelSelector";
import { modelControlStyles as s } from "./style";

export function ModelControls({
  model,
  effort,
  onEffortChange,
  level,
  onLevelChange,
  disabled,
}) {
  const currentEffort =
    reasoningEfforts.find((item) => item.id === effort) || reasoningEfforts[0];
  return (
    <div className={s.group}>
      <ModelSelector model={model} disabled={disabled} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <InputGroupButton
            className={s.settingsTrigger}
            disabled={disabled}
            aria-label={`Learning settings: ${currentEffort.label} effort${level ? `, ${level}` : ""}`}
            title="Effort and learning settings"
          >
            <SlidersHorizontal />
            <span className="hidden sm:inline">
              {currentEffort.label} effort
            </span>
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          collisionPadding={12}
          className={s.menu}
        >
          <DropdownMenuLabel className={s.settingsLabel}>
            Reasoning effort
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={effort} onValueChange={onEffortChange}>
            {reasoningEfforts.map((item) => (
              <DropdownMenuRadioItem
                key={item.id}
                value={item.id}
                className={s.settingsItem}
              >
                <span className={s.effortLabel}>{item.label}</span>
                <span className={s.effortDescription}>{item.description}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {onLevelChange && (
            <>
              <div className={s.divider} role="separator" />
              <DropdownMenuLabel className={s.settingsLabel}>
                Lesson level
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={level}
                onValueChange={onLevelChange}
              >
                {["Beginner", "Intermediate"].map((item) => (
                  <DropdownMenuRadioItem
                    key={item}
                    value={item}
                    className={s.settingsItem}
                  >
                    {item}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
