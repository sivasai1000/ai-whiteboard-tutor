import { DiagramSymbol } from "./DiagramSymbol";
import { hasIllustration, resolveVisualSymbol } from "@/lib/visual-symbols";
import { wrapLabel } from "./visual-layout";
import { visualizationColors } from "./style";

export function DiagramText({
  text,
  x,
  y,
  limit = 20,
  size = 18,
  color = "var(--diagram-muted)",
  weight = 400,
  maxLines = 3,
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={color}
      fontSize={size}
      fontWeight={weight}
    >
      {wrapLabel(text, limit, maxLines).map((line, index) => (
        <tspan key={index} x={x} dy={index ? size * 1.35 : 0}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function DiagramNode({
  node,
  position: p,
  layout,
  active,
  dim,
  compact,
}) {
  const tone = visualizationColors[node.color];
  const symbol = resolveVisualSymbol(node);
  const illustrated = hasIllustration(node);
  const cycle = layout === "cycle",
    equation = layout === "equation";
  const comparison = layout === "comparison";
  const hasSymbol = symbol !== "none";
  const size = equation ? (compact ? 22 : 27) : cycle ? 17 : compact ? 22 : 20;
  const limit = equation ? 32 : cycle ? 12 : p.w < 210 ? 14 : 26;
  const labelLines = wrapLabel(node.label, limit, equation ? 1 : 2).length;
  const labelY = equation
    ? p.h / 2 + 8
    : cycle
      ? illustrated
        ? 116
        : hasSymbol
          ? 62
          : 48
      : illustrated || (comparison && p.illustratedRow)
        ? 114
        : hasSymbol
          ? 62
          : 42;
  const detailY = labelY + (labelLines - 1) * size * 1.35 + 27;

  return (
    <g
      data-node-id={node.id}
      data-focused={active}
      data-dimmed={dim}
      opacity={dim ? 0.4 : 1}
    >
      <title>{`${node.label}${node.detail ? ": " + node.detail : ""}`}</title>
      <rect
        data-node-card=""
        x={p.x}
        y={p.y}
        width={p.w}
        height={p.h}
        rx="16"
        fill={active ? tone.soft : "var(--board)"}
        stroke={active ? tone.ink : "var(--diagram-grid)"}
        strokeWidth={active ? 2 : 1.2}
      />
      {illustrated && !equation && (
        <ellipse
          cx={p.x + p.w / 2}
          cy={p.y + 52}
          rx={cycle ? 38 : 47}
          ry={38}
          fill={active ? "var(--board)" : "var(--diagram-surface)"}
        />
      )}
      {!equation &&
        (hasSymbol ? (
          <DiagramSymbol
            name={symbol}
            x={p.x + p.w / 2 - (illustrated ? 36 : 12)}
            y={p.y + 16}
            size={illustrated ? 72 : 24}
            color={tone.ink}
          />
        ) : (
          <rect
            x={p.x + p.w / 2 - 12}
            y={p.y + 17}
            width="24"
            height="3"
            rx="1.5"
            fill={tone.ink}
          />
        ))}
      <DiagramText
        text={node.label}
        x={p.x + p.w / 2}
        y={p.y + labelY}
        size={size}
        color="var(--diagram-ink)"
        weight={600}
        limit={limit}
        maxLines={equation ? 1 : 2}
      />
      {!equation && !cycle && node.detail && (
        <DiagramText
          text={node.detail}
          x={p.x + p.w / 2}
          y={p.y + detailY}
          limit={p.w < 210 ? 17 : 32}
          size={compact ? 18 : 15}
          maxLines={comparison ? 4 : 2}
        />
      )}
    </g>
  );
}
