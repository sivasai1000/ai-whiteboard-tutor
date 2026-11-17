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
  if (depth > 3) return null;
  const groups = Array.from({ length: depth }, (_, level) =>
    nodes.filter((node) => levels.get(node.id) === level),
  );
  const positions = new Map();
  const rowCount = Math.max(...groups.map((group) => group.length));
  let top = 100;
  for (const [level, group] of groups.entries()) {
    const columns = Math.min(3, group.length);
    for (const [index, node] of group.entries()) {
      if (compact) {
        const w = Math.min(188, (432 - (columns - 1) * 16) / columns);
        const row = Math.floor(index / columns);
        const inRow = Math.min(columns, group.length - row * columns);
        positions.set(node.id, {
          x:
            (480 - inRow * w - (inRow - 1) * 16) / 2 +
            (index % columns) * (w + 16),
          y: top + row * 165,
          w,
          h: 130,
        });
      } else {
        positions.set(node.id, {
          x: (960 - depth * 240 - (depth - 1) * 80) / 2 + level * 320,
          y: 100 + ((rowCount - group.length) / 2 + index) * 170,
          w: 240,
          h: 130,
        });
      }
    }
    top += Math.ceil(group.length / columns) * 165 + 25;
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
        h = 108;
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
      h: 220,
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
      y: 100 + row * 155,
      w,
      h: 125,
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
  return {
    d: `M ${x1} ${y1} C ${horizontal ? (x1 + x2) / 2 : x1} ${horizontal ? y1 : (y1 + y2) / 2}, ${horizontal ? (x1 + x2) / 2 : x2} ${horizontal ? y2 : (y1 + y2) / 2}, ${x2} ${y2}`,
    x: (x1 + x2) / 2,
    y:
      Math.abs(dy) < 1 && Math.abs(x2 - x1) < 70
        ? Math.min(from.y, to.y) - 14
        : (y1 + y2) / 2,
  };
}
