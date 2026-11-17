"use client";

import { ChevronDown, GraduationCap } from "lucide-react";
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

// AI Elements Model Selector pattern: independent model and effort radio menus.
// https://ui.shadcn.com/docs/ai-elements/radix/model-selector
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
            className={s.trigger}
            disabled={disabled}
            aria-label={`Reasoning effort: ${currentEffort.label}`}
          >
            <span className="text-muted-foreground">Effort</span>{" "}
            {currentEffort.label} <ChevronDown />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={s.menu}>
          <DropdownMenuLabel>Reasoning effort</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={effort} onValueChange={onEffortChange}>
            {reasoningEfforts.map((item) => (
              <DropdownMenuRadioItem
                key={item.id}
                value={item.id}
                className={s.item}
              >
                <div>
                  <p>{item.label}</p>
                  <p className={s.description}>{item.description}</p>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {onLevelChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <InputGroupButton
              className={s.trigger}
              disabled={disabled}
              aria-label={`Lesson level: ${level}`}
            >
              <GraduationCap /> {level} <ChevronDown />
            </InputGroupButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Lesson level</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={level} onValueChange={onLevelChange}>
              {["Beginner", "Intermediate"].map((item) => (
                <DropdownMenuRadioItem key={item} value={item}>
                  {item}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
