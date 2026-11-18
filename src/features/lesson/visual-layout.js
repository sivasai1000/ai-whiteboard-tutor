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
  const rowHeight = illustrated ? 232 : 130;
  const rowGap = rowHeight + 44;
  const rowCount = Math.max(...groups.map((group) => group.length));
  const columnWidth = depth === 4 ? 180 : 240;
  const columnGap = depth === 4 ? 64 : 80;
  if (compact) {
    let top = 100;
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
          y: 100 + ((rowCount - group.length) / 2 + index) * rowGap,
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
      y: compact ? 96 + Math.floor(i / columns) * 132 : 146,
      w: cell - 10,
      h: compact ? 72 : 76,
    }));
  }
  if (layout === "cycle") {
    return Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / count;
      const w = compact ? 128 : 176,
        h = illustrated ? 150 : 108;
      return {
        x: width / 2 + Math.cos(angle) * (compact ? 150 : 300) - w / 2,
        y: 290 + Math.sin(angle) * 155 - h / 2,
        w,
        h,
      };
    });
  }
  if (layout === "comparison")
    return [0, 1].map((i) => ({
      x: compact ? 28 + i * 228 : 80 + i * 420,
      y: 145,
      w: compact ? 196 : 380,
      h: illustrated ? 280 : 220,
    }));
  if (layout === "equation") {
    return Array.from({ length: count }, (_, i) => ({
      x: compact ? 35 : 160,
      y: 92 + i * (310 / count),
      w: compact ? 410 : 640,
      h: 310 / count - 10,
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
      y: 100 + row * (illustrated ? 276 : 155),
      w,
      h: illustrated ? 232 : 125,
    };
  });
}

export function connectorPath(from, to) {
  const ax = from.x + from.w / 2,
    ay = from.y + from.h / 2;
  const bx = to.x + to.w / 2,
    by = to.y + to.h / 2;
  const dx = bx - ax,
    dy = by - ay;
  const horizontal =
    Math.abs(dx) / (from.w + to.w) > Math.abs(dy) / (from.h + to.h);
  const x1 = ax + (horizontal ? Math.sign(dx) * (from.w / 2 + 6) : 0);
  const y1 = ay + (!horizontal ? Math.sign(dy) * (from.h / 2 + 6) : 0);
  const x2 = bx - (horizontal ? Math.sign(dx) * (to.w / 2 + 10) : 0);
  const y2 = by - (!horizontal ? Math.sign(dy) * (to.h / 2 + 10) : 0);
  // Put diagonal labels nearer their source so crossing relationships do not
  // stack their labels at the same midpoint. Evaluate the actual cubic path.
  const t = Math.abs(dx) > 1 && Math.abs(dy) > 1 ? 0.32 : 0.5;
  const cubic = (a, b, c, d) =>
    (1 - t) ** 3 * a +
    3 * (1 - t) ** 2 * t * b +
    3 * (1 - t) * t * t * c +
    t ** 3 * d;
  return {
    d: `M ${x1} ${y1} C ${horizontal ? (x1 + x2) / 2 : x1} ${horizontal ? y1 : (y1 + y2) / 2}, ${horizontal ? (x1 + x2) / 2 : x2} ${horizontal ? y2 : (y1 + y2) / 2}, ${x2} ${y2}`,
    x: cubic(
      x1,
      horizontal ? (x1 + x2) / 2 : x1,
      horizontal ? (x1 + x2) / 2 : x2,
      x2,
    ),
    y:
      Math.abs(dy) < 1 && Math.abs(x2 - x1) < 70
        ? Math.min(from.y, to.y) - 14
        : cubic(
            y1,
            horizontal ? y1 : (y1 + y2) / 2,
            horizontal ? y2 : (y1 + y2) / 2,
            y2,
          ) - 14,
  };
}
