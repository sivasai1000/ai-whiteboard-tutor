// Route semantic links around complete node cards, including their text. The
// small orthogonal grid is derived from node edges, not model coordinates.
const padding = 12;
const center = (box) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
const ports = (box) => {
  const c = center(box);
  return [
    { x: box.x - padding, y: c.y },
    { x: box.x + box.w + padding, y: c.y },
    { x: c.x, y: box.y - padding },
    { x: c.x, y: box.y + box.h + padding },
  ];
};

function blocked(a, b, boxes) {
  return boxes.some((box) => {
    const left = box.x - 5,
      right = box.x + box.w + 5;
    const top = box.y - 5,
      bottom = box.y + box.h + 5;
    return a.x === b.x
      ? a.x > left &&
          a.x < right &&
          Math.max(a.y, b.y) > top &&
          Math.min(a.y, b.y) < bottom
      : a.y > top &&
          a.y < bottom &&
          Math.max(a.x, b.x) > left &&
          Math.min(a.x, b.x) < right;
  });
}

function congestion(a, b, routes) {
  let cost = 0;
  for (const route of routes) {
    for (let i = 1; i < route.length; i++) {
      const c = route[i - 1],
        d = route[i];
      if (a.x === b.x && c.x === d.x && a.x === c.x)
        cost +=
          Math.max(
            0,
            Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) -
              Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)),
          ) * 5;
      if (a.y === b.y && c.y === d.y && a.y === c.y)
        cost +=
          Math.max(
            0,
            Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) -
              Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)),
          ) * 5;
    }
  }
  return cost;
}

export function routeConnector(
  from,
  to,
  boxes,
  width,
  height,
  previousRoutes = [],
) {
  const starts = ports(from),
    ends = ports(to);
  const xs = [
    ...new Set([
      8,
      width - 8,
      ...boxes.flatMap((box) => ports(box).map((p) => p.x)),
    ]),
  ].sort((a, b) => a - b);
  const ys = [
    ...new Set([
      8,
      height - 8,
      ...boxes.flatMap((box) => ports(box).map((p) => p.y)),
    ]),
  ].sort((a, b) => a - b);
  const key = (p, axis) => `${p.x}:${p.y}:${axis}`;
  const targets = new Set(ends.map((p) => `${p.x}:${p.y}`));
  const queue = starts.map((p) => ({ ...p, axis: "", cost: 0, path: [p] }));
  const costs = new Map();

  while (queue.length) {
    queue.sort((a, b) => b.cost - a.cost);
    const current = queue.pop();
    if (current.cost > (costs.get(key(current, current.axis)) ?? Infinity))
      continue;
    if (targets.has(`${current.x}:${current.y}`)) {
      // Remove collinear intermediate points for a clean, compact SVG path.
      const points = current.path.filter(
        (p, i, all) =>
          !i ||
          i === all.length - 1 ||
          !(
            (all[i - 1].x === p.x && p.x === all[i + 1].x) ||
            (all[i - 1].y === p.y && p.y === all[i + 1].y)
          ),
      );
      return {
        d: points.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" "),
        points,
      };
    }
    const xi = xs.indexOf(current.x),
      yi = ys.indexOf(current.y);
    const neighbors = [
      { x: xs[xi - 1], y: current.y, axis: "x" },
      { x: xs[xi + 1], y: current.y, axis: "x" },
      { x: current.x, y: ys[yi - 1], axis: "y" },
      { x: current.x, y: ys[yi + 1], axis: "y" },
    ];
    for (const next of neighbors) {
      if (
        next.x === undefined ||
        next.y === undefined ||
        blocked(current, next, boxes)
      )
        continue;
      const cost =
        current.cost +
        Math.abs(next.x - current.x) +
        Math.abs(next.y - current.y) +
        (current.axis && current.axis !== next.axis ? 24 : 0) +
        congestion(current, next, previousRoutes);
      const id = key(next, next.axis);
      if (cost >= (costs.get(id) ?? Infinity)) continue;
      costs.set(id, cost);
      queue.push({ ...next, cost, path: [...current.path, next] });
    }
  }
  return null; // A relationship is still shown in the text key if no safe route exists.
}
