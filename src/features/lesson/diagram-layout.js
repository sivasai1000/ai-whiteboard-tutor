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
  const containsLabelledShape = elements.some((other) => {
    if (
      other.id === element.id ||
      !other.text ||
      !["rect", "circle"].includes(other.type)
    )
      return false;
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
  return { x, y: containsLabelledShape ? Math.max(24, box.top - 18) : y };
}
