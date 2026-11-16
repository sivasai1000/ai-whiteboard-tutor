import {
  Sun,
  BrainCircuit,
  TrendingUp,
  Waves,
  Variable,
  Globe2,
  Atom,
  Dice5,
  Coffee,
  Code2,
  Leaf,
  ChartPie,
} from "lucide-react";
const icons = {
  sun: Sun,
  brain: BrainCircuit,
  trending: TrendingUp,
  waves: Waves,
  function: Variable,
  globe: Globe2,
  atom: Atom,
  dice: Dice5,
  coffee: Coffee,
  code: Code2,
  leaf: Leaf,
  pie: ChartPie,
};
export function TopicIcon({ name, ...props }) {
  const Icon = icons[name] ?? BrainCircuit;
  return <Icon {...props} />;
}
