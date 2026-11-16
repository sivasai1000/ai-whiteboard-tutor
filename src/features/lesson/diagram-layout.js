function bounds(element) {
  const { type, x, y, width, height } = element;
  return type === "circle"
    ? {
        left: x - width / 2,
        top: y - width / 2,
        right: x + width / 2,
        bottom: y + width / 2,
      }
    : { left: x, top: y, right: x + width, bottom: y + height };
}

export function shapeLabelPosition(element, elements) {
  const box = bounds(element);
  const x = (box.left + box.right) / 2;
  const y = (box.top + box.bottom) / 2;
  const containsLabelledContent = elements.some((other) => {
    if (other.id === element.id || !other.text) return false;
    // A model can supply a separate annotation inside a labelled box. Keep
    // the box heading above it instead of drawing both labels at the center.
    if (["text", "equation"].includes(other.type)) {
      return (
        other.x >= box.left &&
        other.x <= box.right &&
        other.y >= box.top &&
        other.y <= box.bottom
      );
    }
    if (!["rect", "circle"].includes(other.type)) return false;
    const child = bounds(other);
    return (
      child.left >= box.left &&
      child.right <= box.right &&
      child.top >= box.top &&
      child.bottom <= box.bottom &&
      (child.right - child.left < box.right - box.left ||
        child.bottom - child.top < box.bottom - box.top)
    );
  });
  // Container headings use a stable position above their shape. Consider all
  // scene elements so the heading never jumps when a child is revealed later.
  return { x, y: containsLabelledContent ? Math.max(24, box.top - 18) : y };
}
