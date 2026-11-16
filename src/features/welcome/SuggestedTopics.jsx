import { TopicIcon } from "./TopicIcon";
import { welcomeStyles as s } from "./style";

const suggestions = [
  {
    label: "Neural networks",
    topic: "Explain how neural networks learn.",
    icon: "brain",
  },
  {
    label: "The solar system",
    topic: "Explain how our solar system works.",
    icon: "sun",
  },
  {
    label: "Compound interest",
    topic: "Explain compound interest with a simple example.",
    icon: "trending",
  },
  {
    label: "How waves work",
    topic: "Explain waves, amplitude, and frequency.",
    icon: "waves",
  },
];

export function SuggestedTopics({ onSelect, disabled }) {
  return (
    <div
      className="mt-5 flex w-full flex-wrap justify-center gap-2"
      aria-label="Suggested learning topics"
    >
      {suggestions.map((item) => (
        <button
          key={item.label}
          type="button"
          className={s.suggestion}
          onClick={() => onSelect(item.topic)}
          disabled={disabled}
        >
          <TopicIcon
            name={item.icon}
            className="size-3.5 text-primary/80"
            strokeWidth={1.5}
          />
          {item.label}
        </button>
      ))}
    </div>
  );
}
