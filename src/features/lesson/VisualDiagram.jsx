"use client";

import { useId, useMemo } from "react";
import { resolveVisualStep } from "@/lib/visual-lesson";
import { cn } from "@/lib/utils";
import { ArrayDiagram } from "./ArrayDiagram";
import { connectorPath, diagramPositions, wrapLabel } from "./visual-layout";
import { visualizationColors as colors } from "./style";
import { DiagramSymbol } from "./DiagramSymbol";
import { hasIllustration, resolveVisualSymbol } from "@/lib/visual-symbols";

const numberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumSignificantDigits: 3,
});

function TextLines({
  text,
  x,
  y,
  limit,
  size = 18,
  color = "#64748b",
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

export function VisualDiagram({
  scene,
  stepIndex,
  compact,
  elapsed = 0,
  reducedMotion = false,
  className,
}) {
  const uid = useId().replaceAll(":", "");
  const state = useMemo(
    () => resolveVisualStep(scene, stepIndex),
    [scene, stepIndex],
  );
  const width = compact ? 480 : 960;
  // Recompose conceptual scenes around what is actually being taught. Ordered
  // arrays, comparisons, charts and cycles keep their fixed spatial meaning.
  const layoutNodes = ["concept", "flow"].includes(state.layout)
    ? state.nodes.filter((node) => state.visible.has(node.id))
    : state.nodes;
  const layoutIds = new Set(layoutNodes.map((node) => node.id));
  const layoutLinks = state.links.filter(
    (link) => layoutIds.has(link.from) && layoutIds.has(link.to),
  );
  const positions = diagramPositions(
    state.layout,
    layoutNodes.length,
    compact,
    layoutNodes,
    layoutLinks,
  );
  const height = Math.max(
    state.layout === "array"
      ? compact
        ? 420
        : 380
      : state.layout === "cycle"
        ? 600
        : ["concept", "flow"].includes(state.layout)
          ? 340
          : 500,
    ...positions.map((p) => p.y + p.h + 42),
  );
  const positionById = new Map(
    layoutNodes.map((node, index) => [node.id, positions[index]]),
  );
  const connectorBounds = (id, otherId) => {
    const p = positionById.get(id);
    const node = state.nodes.find((item) => item.id === id);
    if (
      !hasIllustration(node) ||
      (compact && p.y !== positionById.get(otherId).y)
    )
      return p;
    const comparison = state.layout === "comparison",
      cycle = state.layout === "cycle";
    const radius = comparison ? 72 : cycle ? 46 : 52;
    return {
      x: p.x + p.w / 2 - radius,
      y: p.y + (comparison ? 70 : cycle ? 50 : 55) - radius,
      w: radius * 2,
      h: radius * 2,
    };
  };
  const draw = reducedMotion ? 1 : Math.min(1, Math.max(0, elapsed / 0.45));
  const description = state.nodes
    .filter((n) => state.visible.has(n.id))
    .map(
      (n) =>
        `${n.label}${state.layout === "bars" ? `: ${n.value} ${state.unit}` : ""}${n.detail ? ": " + n.detail : ""}${state.focus.has(n.id) ? " (highlighted)" : ""}${state.dim.has(n.id) ? " (discarded or background)" : ""}`,
    )
    .join(". ");
  const domain = Math.max(
    1,
    ...scene.visual.nodes.map((n) => n.value),
    ...scene.steps.flatMap((step) => step.updates.map((n) => n.value)),
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${scene.visual.caption}. ${state.note}. ${description}`}
      className={cn("block w-full select-none", className)}
      data-visual-layout={state.layout}
      data-step={state.index}
    >
      <title>{scene.visual.caption}</title>
      <defs>
        <marker
          id={`${uid}-arrow`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M 1 1 L 8 5 L 1 9"
            fill="none"
            stroke="#7282ad"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </marker>
      </defs>
      <TextLines
        text={state.caption}
        x={width / 2}
        y={30}
        limit={compact ? 34 : 65}
        size={compact ? 16 : 17}
        weight={500}
        maxLines={2}
      />
      {state.layout === "cycle" && (
        <ellipse
          cx={width / 2}
          cy="290"
          rx={compact ? 150 : 300}
          ry="155"
          fill="none"
          stroke="#edf0f8"
          strokeWidth="24"
        />
      )}
      {state.layout !== "bars" &&
        state.links.map((link, index) => {
          if (!state.visible.has(link.from) || !state.visible.has(link.to))
            return null;
          const path = connectorPath(
            connectorBounds(link.from, link.to),
            connectorBounds(link.to, link.from),
          );
          const active = state.focus.has(link.to) || state.focus.has(link.from);
          // On a narrow board, share repeated relationship labels at a branch
          // or merge instead of stacking identical text over crossing arrows.
          let showLabel = Boolean(link.label);
          let labelX = path.x,
            labelY = path.y;
          if (compact && link.label) {
            const visibleLinks = state.links.filter(
              (item) =>
                state.visible.has(item.from) && state.visible.has(item.to),
            );
            const outgoing = visibleLinks.filter(
              (item) => item.from === link.from && item.label === link.label,
            );
            const incoming = visibleLinks.filter(
              (item) => item.to === link.to && item.label === link.label,
            );
            const from = positionById.get(link.from),
              to = positionById.get(link.to);
            if (outgoing.length > 1 && Math.abs(to.y - from.y) > from.h) {
              showLabel = outgoing[0] === link;
              labelX = from.x + from.w / 2;
              labelY = from.y + from.h + 22;
            } else if (incoming.length > 1 && Math.abs(to.y - from.y) > to.h) {
              showLabel = incoming[0] === link;
              labelX = to.x + to.w / 2;
              labelY = to.y - 30;
            }
          }
          const labelWidth = Math.max(
            36,
            Math.min(link.label.length, compact ? 14 : 20) * (compact ? 8 : 7) +
              14,
          );
          return (
            <g
              key={index}
              opacity={
                state.dim.has(link.from) && state.dim.has(link.to) ? 0.25 : 1
              }
            >
              <path
                d={path.d}
                fill="none"
                stroke={active ? "#6975dc" : "#bdc7db"}
                strokeWidth={active ? 2.5 : 1.6}
                markerEnd={`url(#${uid}-arrow)`}
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={active ? 1 - draw : 0}
              />
              {showLabel && (
                <g>
                  <rect
                    x={labelX - labelWidth / 2}
                    y={labelY - 13}
                    width={labelWidth}
                    height={link.label.length > (compact ? 14 : 20) ? 40 : 24}
                    rx="11"
                    fill="#ffffff"
                  />
                  <TextLines
                    text={link.label}
                    x={labelX}
                    y={labelY + 3}
                    size={compact ? 15 : 13}
                    limit={compact ? 14 : 20}
                    maxLines={2}
                  />
                </g>
              )}
            </g>
          );
        })}
      {state.layout === "array" ? (
        <ArrayDiagram state={state} positions={positions} compact={compact} />
      ) : state.layout === "bars" ? (
        <>
          {state.unit && (
            <text
              x={width - 30}
              y="86"
              textAnchor="end"
              fill="#64748b"
              fontSize="13"
            >
              {state.unit}
            </text>
          )}
          {[0, 0.5, 1].map((ratio) => (
            <g key={ratio}>
              <line
                x1="60"
                x2={width - 30}
                y1={365 - ratio * 245}
                y2={365 - ratio * 245}
                stroke="#e7ebf3"
                strokeDasharray={ratio ? "4 5" : undefined}
              />
              <text
                x="49"
                y={369 - ratio * 245}
                textAnchor="end"
                fill="#7b879e"
                fontSize="12"
              >
                {numberFormat.format(domain * ratio)}
              </text>
            </g>
          ))}
          {state.nodes.map((node, index) => {
            if (!state.visible.has(node.id)) return null;
            const band = (width - 100) / state.nodes.length,
              x = 70 + index * band,
              barWidth = Math.min(compact ? 40 : 76, band * 0.62),
              height = (node.value / domain) * 245,
              active = state.focus.has(node.id),
              tone = colors[node.color];
            return (
              <g
                key={node.id}
                data-node-id={node.id}
                data-focused={active}
                data-dimmed={state.dim.has(node.id)}
                opacity={state.dim.has(node.id) ? 0.35 : 1}
              >
                <title>{`${node.label}: ${node.value} ${state.unit}`}</title>
                <rect
                  x={x + (band - barWidth) / 2}
                  y={365 - height}
                  width={barWidth}
                  height={Math.max(2, height)}
                  rx="7"
                  fill={active ? tone.ink : tone.soft}
                  stroke={tone.ink}
                  strokeWidth={active ? 2 : 1}
                />
                <text
                  x={x + band / 2}
                  y={351 - height}
                  textAnchor="middle"
                  fill={tone.ink}
                  fontWeight="600"
                  fontSize={compact ? 15 : 21}
                >
                  {numberFormat.format(node.value)}
                </text>
                <TextLines
                  text={node.label}
                  x={x + band / 2}
                  y="390"
                  size={compact ? 13 : 17}
                  limit={compact ? 9 : 14}
                  maxLines={2}
                />
              </g>
            );
          })}
        </>
      ) : (
        state.nodes.map((node) => {
          if (!state.visible.has(node.id)) return null;
          const p = positionById.get(node.id),
            active = state.focus.has(node.id),
            dim = state.dim.has(node.id),
            tone = colors[node.color];
          const cycle = state.layout === "cycle",
            equation = state.layout === "equation",
            comparison = state.layout === "comparison";
          const symbol = resolveVisualSymbol(node);
          const illustrated = hasIllustration(node);
          const hasSymbol = symbol !== "none";
          const narrow = p.w < 155;
          const tight = p.w < 210;
          const labelY = equation
            ? p.y + p.h / 2 + 7
            : illustrated
              ? p.y + (comparison ? 155 : cycle ? 119 : 124)
              : p.y +
                (comparison
                  ? 75
                  : cycle
                    ? hasSymbol
                      ? 73
                      : 49
                    : hasSymbol
                      ? 52
                      : 35);
          const labelSize = equation
            ? compact
              ? 21
              : 27
            : cycle
              ? compact
                ? 20
                : 19
              : narrow
                ? 15
                : compact
                  ? 22
                  : 20;
          return (
            <g
              key={node.id}
              data-node-id={node.id}
              data-focused={active}
              data-dimmed={dim}
              opacity={dim ? 0.35 : 1}
            >
              {illustrated ? (
                <ellipse
                  cx={p.x + p.w / 2}
                  cy={p.y + (comparison ? 70 : cycle ? 50 : 55)}
                  rx={comparison ? 72 : cycle ? 46 : 52}
                  ry={comparison ? 62 : cycle ? 46 : 49}
                  fill={active ? tone.soft : "#f4f6fa"}
                  stroke={active ? tone.ink : "#e8edf5"}
                  strokeWidth={active ? 1.5 : 0.8}
                />
              ) : (
                <rect
                  x={p.x}
                  y={p.y}
                  width={p.w}
                  height={p.h}
                  rx={12}
                  fill={active ? tone.soft : "#ffffff"}
                  stroke={active ? tone.ink : "#dde4ef"}
                  strokeWidth={active ? 2 : 1}
                />
              )}
              {!equation &&
                (hasSymbol ? (
                  <DiagramSymbol
                    name={symbol}
                    x={
                      illustrated
                        ? p.x + p.w / 2 - (comparison ? 50 : cycle ? 32 : 36)
                        : cycle || comparison
                          ? p.x + p.w / 2 - 15
                          : p.x + 16
                    }
                    y={p.y + (illustrated ? 18 : 15)}
                    size={
                      illustrated
                        ? comparison
                          ? 100
                          : cycle
                            ? 64
                            : 72
                        : cycle || comparison
                          ? 30
                          : 20
                    }
                    color={tone.ink}
                  />
                ) : (
                  <rect
                    x={p.x + 18}
                    y={p.y + 14}
                    width="22"
                    height="3"
                    rx="1.5"
                    fill={tone.ink}
                  />
                ))}
              <TextLines
                text={node.label}
                x={p.x + p.w / 2}
                y={labelY}
                size={labelSize}
                color={active ? tone.ink : "#24324b"}
                weight={600}
                limit={
                  equation
                    ? 32
                    : cycle
                      ? 12
                      : narrow
                        ? 12
                        : compact || tight
                          ? 14
                          : 20
                }
                maxLines={equation ? 1 : 2}
              />
              {!equation && !cycle && node.detail && (
                <TextLines
                  text={node.detail}
                  x={p.x + p.w / 2}
                  y={
                    p.y +
                    (illustrated
                      ? comparison
                        ? 197
                        : 190
                      : comparison
                        ? 134
                        : hasSymbol
                          ? 99
                          : 83)
                  }
                  limit={compact ? 17 : tight ? 20 : 32}
                  size={compact ? 18 : narrow ? 11 : 15}
                  maxLines={comparison ? 4 : 2}
                />
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}
