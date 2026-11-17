"use client";

import { useId, useMemo } from "react";
import {
  Sun,
  Droplets,
  Cloud,
  CloudRain,
  Leaf,
  Earth,
  Atom,
  Brain,
  Cpu,
  Battery,
  Lightbulb,
  Settings,
  Server,
  UserRound,
  Database,
} from "lucide-react";
import { resolveVisualStep } from "@/lib/visual-lesson";
import { cn } from "@/lib/utils";
import { ArrayDiagram } from "./ArrayDiagram";
import { connectorPath, diagramPositions, wrapLabel } from "./visual-layout";
import { visualizationColors as colors } from "./style";

const symbols = {
  sun: Sun,
  water: Droplets,
  cloud: Cloud,
  rain: CloudRain,
  leaf: Leaf,
  earth: Earth,
  atom: Atom,
  brain: Brain,
  chip: Cpu,
  battery: Battery,
  light: Lightbulb,
  gear: Settings,
  server: Server,
  person: UserRound,
  database: Database,
};
const numberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumSignificantDigits: 3,
});

function NodeSymbol({ name, x, y, color, size = 24 }) {
  const Icon = symbols[name];
  return Icon ? (
    <Icon
      x={x}
      y={y}
      width={size}
      height={size}
      color={color}
      strokeWidth={1.6}
      aria-hidden="true"
    />
  ) : null;
}

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
  const positions = diagramPositions(
    state.layout,
    state.nodes.length,
    compact,
    state.nodes,
    state.links,
  );
  const height = Math.max(
    state.layout === "array"
      ? compact
        ? 420
        : 380
      : state.layout === "cycle"
        ? 600
        : 500,
    ...positions.map((p) => p.y + p.h + 90),
  );
  const positionById = new Map(
    state.nodes.map((node, index) => [node.id, positions[index]]),
  );
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
      <text
        x="30"
        y="38"
        fontSize={compact ? 15 : 16}
        fontWeight="500"
        fill="#64748b"
      >
        {state.caption}
      </text>
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
            positionById.get(link.from),
            positionById.get(link.to),
          );
          const active = state.focus.has(link.to) || state.focus.has(link.from);
          const labelWidth = Math.max(
            36,
            link.label.length * (compact ? 6 : 7) + 12,
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
              {link.label && (
                <g>
                  <rect
                    x={path.x - labelWidth / 2}
                    y={path.y - 12}
                    width={labelWidth}
                    height="22"
                    rx="11"
                    fill="#ffffff"
                  />
                  <TextLines
                    text={link.label}
                    x={path.x}
                    y={path.y + 3}
                    size={compact ? 11 : 13}
                    limit={22}
                    maxLines={1}
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
        state.nodes.map((node, index) => {
          if (!state.visible.has(node.id)) return null;
          const p = positions[index],
            active = state.focus.has(node.id),
            dim = state.dim.has(node.id),
            tone = colors[node.color];
          const cycle = state.layout === "cycle",
            equation = state.layout === "equation",
            comparison = state.layout === "comparison";
          const hasSymbol = Boolean(symbols[node.symbol]);
          const narrow = p.w < 155;
          const labelY = equation
            ? p.y + p.h / 2 + 7
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
                ? 16
                : 19
              : narrow
                ? 15
                : compact
                  ? 18
                  : 20;
          return (
            <g
              key={node.id}
              data-node-id={node.id}
              data-focused={active}
              data-dimmed={dim}
              opacity={dim ? 0.35 : 1}
            >
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={12}
                fill={active ? tone.soft : "#ffffff"}
                stroke={active ? tone.ink : "#dde4ef"}
                strokeWidth={active ? 1.6 : 1}
              />
              {!equation &&
                (hasSymbol ? (
                  <NodeSymbol
                    name={node.symbol}
                    x={cycle || comparison ? p.x + p.w / 2 - 15 : p.x + 16}
                    y={p.y + 15}
                    size={cycle || comparison ? 30 : 20}
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
                  equation ? 32 : cycle ? 16 : narrow ? 14 : compact ? 16 : 20
                }
                maxLines={equation ? 1 : 2}
              />
              {!equation && !cycle && node.detail && (
                <TextLines
                  text={node.detail}
                  x={p.x + p.w / 2}
                  y={p.y + (comparison ? 134 : hasSymbol ? 99 : 83)}
                  limit={narrow ? 16 : compact ? 20 : 32}
                  size={narrow ? 11 : compact ? 13 : 15}
                  maxLines={comparison ? 4 : 2}
                />
              )}
            </g>
          );
        })
      )}
      {state.note && (
        <g>
          <line
            x1={width / 2 - 13}
            y1={height - 72}
            x2={width / 2 + 13}
            y2={height - 72}
            stroke="#c1cbed"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <TextLines
            text={state.note}
            x={width / 2}
            y={height - 43}
            limit={compact ? 40 : 75}
            size={compact ? 18 : 20}
            color="#4055a1"
            weight={500}
            maxLines={2}
          />
        </g>
      )}
    </svg>
  );
}
