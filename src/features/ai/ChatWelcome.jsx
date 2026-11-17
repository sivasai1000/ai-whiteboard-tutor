import { BookOpen, Code2, Lightbulb, PenLine } from "lucide-react";
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
        <p className={s.welcomeEyebrow}>YOUR SPACE TO THINK</p>
        <h1 className={s.heading}>What’s on your mind?</h1>
        <p className={s.subtitle}>
          A question, a rough idea, a problem to work through.
          <br className="hidden sm:block" /> Start anywhere. We’ll take it from
          there.
        </p>
        <div className="mt-8 w-full">{children}</div>
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
        <p className={s.welcomeNote}>
          Conversations stay on this device. Bookmark the ones worth keeping.
        </p>
      </div>
    </div>
  );
}
