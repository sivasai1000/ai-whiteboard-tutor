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
    /\blioness(?:es)?\b/i.test(`${node.label} ${node.detail || ""}`)
  )
    return "lioness";
  if (node.symbol && node.symbol !== "none") return node.symbol;
  // Old lessons can gain an illustration only when their text names one
  // unambiguous subject. "Zebra or buffalo" must not become either animal.
  const matches = new Set(
    (`${node.label} ${node.detail || ""}`.match(animals) || []).map(normalize),
  );
  return matches.size === 1 ? [...matches][0] : "none";
}

export function hasIllustration(node) {
  return illustrated.has(resolveVisualSymbol(node));
}
