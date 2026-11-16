import { describe, expect, it } from "vitest";
import { shapeLabelPosition } from "../src/features/lesson/diagram-layout.js";

describe("nested diagram headings", () => {
  const container = {
    id: "array",
    type: "rect",
    x: 260,
    y: 180,
    width: 440,
    height: 100,
    text: "Sorted array",
  };
  const middle = {
    id: "middle",
    type: "circle",
    x: 480,
    y: 230,
    width: 70,
    height: 70,
    text: "middle",
    appearAt: 0.5,
  };

  it("keeps a container title clear of the labelled item inside it", () => {
    const elements = [container, middle];
    const parent = shapeLabelPosition(container, elements);
    const child = shapeLabelPosition(middle, elements);
    expect(parent.y).toBeLessThan(container.y);
    expect(child).toEqual({ x: 480, y: 230 });
    expect(parent.x).toBe(child.x);
    expect(child.y - parent.y).toBeGreaterThan(50);
  });

  it("keeps adjacent array values centered in their own cells", () => {
    const cells = [2, 5, 8].map((value, index) => ({
      id: String(value),
      type: "rect",
      x: 90 + index * 110,
      y: 200,
      width: 110,
      height: 70,
      text: String(value),
    }));
    expect(cells.map((cell) => shapeLabelPosition(cell, cells))).toEqual([
      { x: 145, y: 235 },
      { x: 255, y: 235 },
      { x: 365, y: 235 },
    ]);
  });

  it("does not move titles when a nested shape has no label", () => {
    expect(
      shapeLabelPosition(container, [container, { ...middle, text: "" }]),
    ).toEqual({ x: 480, y: 230 });
  });

  it("separates a box heading from a later annotation inside the box", () => {
    const air = {
      id: "air",
      type: "rect",
      x: 120,
      y: 190,
      width: 190,
      height: 110,
      text: "Air",
    };
    const annotation = {
      id: "co2",
      type: "text",
      x: 215,
      y: 245,
      text: "Carbon dioxide (CO₂)",
      appearAt: 0.2,
    };
    const position = shapeLabelPosition(air, [air, annotation]);
    expect(position).toEqual({ x: 215, y: 172 });
    expect(annotation.y - position.y).toBeGreaterThan(50);
    expect(
      shapeLabelPosition(air, [air, { ...annotation, y: 350 }]),
    ).toEqual({ x: 215, y: 245 });
  });
});
