import { hasIllustration } from "../../lib/visual-symbols.js";

export function wrapLabel(text, limit = 20, maxLines = 3) {
  const lines = [];
  let line = "";
  const words = String(text || "")
    .split(/\s+/)
    .flatMap((word) => {
      const chunks = [];
      for (let i = 0; i < word.length; i += limit)
        chunks.push(word.slice(i, i + limit));
      return chunks;
    });
  for (const word of words) {
    if (line && `${line} ${word}`.length > limit) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const last = lines.slice(maxLines - 1).join(" ");
    return [
      ...lines.slice(0, maxLines - 1),
      last.length > limit ? `${last.slice(0, limit - 1)}…` : last,
    ];
  }
  return lines;
}

function conceptPositions(nodes, links, compact) {
  if (!links.length) return null;
  const levels = new Map(nodes.map((node) => [node.id, 0]));
  // Topological layers keep inputs, intermediate concepts and outputs separate.
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const link of links) {
      if (levels.get(link.to) <= levels.get(link.from)) {
        levels.set(link.to, levels.get(link.from) + 1);
        changed = true;
      }
    }
    if (!changed) break;
    if (pass === nodes.length - 1) return null; // Cycles use the stable grid.
  }
  const depth = Math.max(...levels.values()) + 1;
  if (depth > 4) return null;
  const groups = Array.from({ length: depth }, (_, level) =>
    nodes.filter((node) => levels.get(node.id) === level),
  );
  const positions = new Map();
  const illustrated = nodes.some(hasIllustration);
  const rowHeight = illustrated ? 234 : 150;
  const rowGap = rowHeight + 64;
  const rowCount = Math.max(...groups.map((group) => group.length));
  const columnWidth = depth === 4 ? 180 : 240;
  const columnGap = depth === 4 ? 64 : 80;
  if (compact) {
    let top = 24;
    for (let level = 0; level < groups.length; level++) {
      let group = groups[level];
      // A simple input → output pair fits on one mobile row. Keep branches
      // on their own row so feeding/process direction remains unambiguous.
      if (group.length === 1 && groups[level + 1]?.length === 1)
        group = [...group, ...groups[++level]];
      const columns = Math.min(2, group.length);
      const w = Math.min(188, (432 - (columns - 1) * 32) / columns);
      for (const [index, node] of group.entries()) {
        const row = Math.floor(index / columns);
        const inRow = Math.min(columns, group.length - row * columns);
        positions.set(node.id, {
          x:
            (480 - inRow * w - (inRow - 1) * 32) / 2 +
            (index % columns) * (w + 32),
          y: top + row * rowGap,
          w,
          h: rowHeight,
        });
      }
      top += Math.ceil(group.length / columns) * rowGap + 25;
    }
  } else {
    for (const [level, group] of groups.entries()) {
      for (const [index, node] of group.entries()) {
        positions.set(node.id, {
          x:
            (960 - depth * columnWidth - (depth - 1) * columnGap) / 2 +
            level * (columnWidth + columnGap),
          y: 24 + ((rowCount - group.length) / 2 + index) * rowGap,
          w: columnWidth,
          h: rowHeight,
        });
      }
    }
  }
  return nodes.map((node) => positions.get(node.id));
}

export function diagramPositions(
  layout,
  count,
  compact,
  nodes = [],
  links = [],
) {
  if (layout === "concept" && nodes.length) {
    const layered = conceptPositions(nodes, links, compact);
    if (layered) return layered;
  }
  const width = compact ? 480 : 960;
  const illustrated = nodes.some(hasIllustration);
  if (layout === "array") {
    const columns = compact ? Math.min(4, count) : count;
    const cell = compact ? 94 : Math.min(110, 840 / count);
    return Array.from({ length: count }, (_, i) => ({
      x: (width - columns * cell) / 2 + (i % columns) * cell + 5,
      y: compact ? 48 + Math.floor(i / columns) * 132 : 70,
      w: cell - 10,
      h: compact ? 72 : 76,
    }));
  }
  if (layout === "cycle") {
    return Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / count;
      const w = compact ? 128 : 176,
        h = illustrated ? 166 : 110;
      return {
        x: width / 2 + Math.cos(angle) * (compact ? 150 : 300) - w / 2,
        y:
          (compact ? 340 : 300) +
          Math.sin(angle) * (compact ? 224 : 210) -
          h / 2,
        w,
        h,
      };
    });
  }
  if (layout === "comparison") {
    const labelY = illustrated ? 114 : 42;
    const labelSize = compact ? 22 : 20;
    const detailSize = compact ? 18 : 15;
    const height = Math.max(
      160,
      ...nodes.map((node) => {
        const labels = wrapLabel(node.label, compact ? 14 : 26, 2).length;
        const details = wrapLabel(node.detail, compact ? 17 : 32, 4).length;
        return (
          labelY +
          (labels - 1) * labelSize * 1.35 +
          (details ? 27 + (details - 1) * detailSize * 1.35 : 0) +
          24
        );
      }),
    );
    return [0, 1].map((i) => ({
      x: compact ? 28 + i * 228 : 80 + i * 420,
      y: 24,
      w: compact ? 196 : 380,
      h: height,
      illustratedRow: illustrated,
    }));
  }
  if (layout === "equation") {
    return Array.from({ length: count }, (_, i) => ({
      x: compact ? 35 : 160,
      y: 24 + i * 96,
      w: compact ? 410 : 640,
      h: 72,
    }));
  }
  const columns = compact ? 2 : 3;
  const gap = compact ? 32 : 54,
    w = compact ? 188 : 240;
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / columns),
      inRow = Math.min(columns, count - row * columns);
    const column =
      layout === "flow" && row % 2 ? inRow - 1 - (i % columns) : i % columns;
    return {
      x: (width - inRow * w - (inRow - 1) * gap) / 2 + column * (w + gap),
      y: 24 + row * (illustrated ? 298 : 214),
      w,
      h: illustrated ? 234 : 150,
    };
  });
}
