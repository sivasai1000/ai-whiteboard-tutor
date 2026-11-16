import { BookOpen, Code2, Lightbulb, PenLine } from "lucide-react";
import { BrandMark } from "@/components/layout/Brand";
import { aiStyles as s } from "./style";

const suggestions = [
  {
    icon: BookOpen,
    label: "Understand a concept",
    prompt:
      "Explain how neural networks learn, using a simple everyday analogy.",
  },
  {
    icon: PenLine,
    label: "Help me write",
    prompt:
      "Help me write a clear introduction for my project. Ask me what you need to know first.",
  },
  {
    icon: Code2,
    label: "Work through code",
    prompt:
      "Teach me how JavaScript promises work with a small practical example.",
  },
  {
    icon: Lightbulb,
    label: "Explore an idea",
    prompt:
      "Help me brainstorm a small project that would make learning more interactive.",
  },
];

export function ChatWelcome({ children, onSuggestion, disabled }) {
  return (
    <div className={s.empty}>
      <div className={s.emptyContent}>
        <BrandMark className="size-12 text-primary" />
        <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-primary/80">
          A little space to think
        </p>
        <h1 className={s.heading}>What’s on your mind?</h1>
        <p className={s.subtitle}>
          Start with a question. Follow an idea.
          <br className="hidden sm:block" /> Let’s make something clearer,
          together.
        </p>
        <div className="mt-9 w-full text-left">{children}</div>
        <div className={s.suggestions}>
          {suggestions.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              className={s.suggestion}
              disabled={disabled}
              onClick={() => onSuggestion(prompt)}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
        <p className="mt-7 text-[11px] text-muted-foreground/70">
          Your conversations stay in this browser.
        </p>
      </div>
    </div>
  );
}
