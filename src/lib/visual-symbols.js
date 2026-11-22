/** Shared vocabulary for generation and rendering; never fetch model-provided images. */
export const VISUAL_SYMBOLS = [
  "none",
  "sun",
  "water",
  "cloud",
  "rain",
  "leaf",
  "earth",
  "moon",
  "atom",
  "brain",
  "chip",
  "battery",
  "light",
  "gear",
  "server",
  "person",
  "database",
  "lion",
  "lioness",
  "antelope",
  "zebra",
  "buffalo",
  "mouse",
  "tree",
  "flower",
  "fish",
  "bird",
  "vulture",
  "grass",
];

const illustrated = new Set([
  "sun",
  "earth",
  "moon",
  "lion",
  "lioness",
  "antelope",
  "zebra",
  "buffalo",
  "mouse",
  "tree",
  "flower",
  "fish",
  "bird",
  "vulture",
  "grass",
]);
const animals =
  /\b(lions?|antelopes?|zebras?|buffalo(?:es)?|mice|mouse|trees?|flowers?|fish|birds?)\b/gi;
const normalize = (word) =>
  word
    .toLowerCase()
    .replace(/buffaloes$/, "buffalo")
    .replace(/^mice$/, "mouse")
    .replace(/s$/, "");

export function resolveVisualSymbol(node) {
  if (
    ["lion", "lioness", "none"].includes(node.symbol) &&
    /\blioness(?:es)?\b/i.test(node.label)
  )
    return "lioness";
  if (node.symbol && node.symbol !== "none") return node.symbol;
  // Infer only from the subject, not its description. A node about grass
  // eaten by a zebra must stay grass, and "Zebra or buffalo" is neither alone.
  const matches = new Set((node.label.match(animals) || []).map(normalize));
  return matches.size === 1 ? [...matches][0] : "none";
}

export function hasIllustration(node) {
  return illustrated.has(resolveVisualSymbol(node));
}
