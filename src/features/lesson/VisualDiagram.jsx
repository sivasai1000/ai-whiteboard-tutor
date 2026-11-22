"use client";

import { useId, useMemo } from "react";
import { resolveVisualStep } from "@/lib/visual-lesson";
import { cn } from "@/lib/utils";
import { ArrayDiagram } from "./ArrayDiagram";
import { diagramPositions } from "./visual-layout";
import { routeConnector } from "./diagram-connectors";
import { DiagramNode, DiagramText as TextLines } from "./DiagramNode";
import { visualizationColors as colors } from "./style";

const numberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumSignificantDigits: 3,
});

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
  const geometry = useMemo(() => {
    const nodes = ["concept", "flow"].includes(state.layout)
      ? state.nodes.filter((node) => state.visible.has(node.id))
      : state.nodes;
    const ids = new Set(nodes.map((node) => node.id));
    const links = state.links.filter(
      (link) => ids.has(link.from) && ids.has(link.to),
    );
    const positions = diagramPositions(
      state.layout,
      nodes.length,
      compact,
      nodes,
      links,
    );
    const height = Math.max(
      state.layout === "bars" ? 440 : 160,
      ...positions.map((p) => p.y + p.h + (state.layout === "array" ? 64 : 24)),
    );
    const byId = new Map(
      nodes.map((node, index) => [node.id, positions[index]]),
    );
    const visibleLinks = links.filter(
      (link) => state.visible.has(link.from) && state.visible.has(link.to),
    );
    const routes = [];
    if (!["array", "bars", "equation"].includes(state.layout)) {
      for (const link of visibleLinks) {
        const route = routeConnector(
          byId.get(link.from),
          byId.get(link.to),
          positions,
          width,
          height,
          routes.filter((item) => item.points).map((item) => item.points),
        );
        routes.push({ ...link, ...route });
      }
    }
    return { positions, byId, height, routes, visibleLinks };
  }, [state, compact, width]);
  const {
    positions,
    byId: positionById,
    height,
    routes,
    visibleLinks,
  } = geometry;
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
    <div className="w-full">
      <p className="mb-3 px-2 text-center text-xs font-medium leading-relaxed text-muted-foreground sm:text-[13px]">
        {state.caption}
      </p>
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
              stroke="var(--diagram-muted)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </marker>
        </defs>
        {routes.map((link, index) => {
          if (!link.d) return null;
          const active = state.focus.has(link.from) || state.focus.has(link.to);
          return (
            <path
              key={index}
              data-connector={`${link.from}:${link.to}`}
              d={link.d}
              fill="none"
              stroke={active ? "var(--diagram-indigo)" : "var(--diagram-line)"}
              strokeWidth={active ? 2.5 : 1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
              markerEnd={`url(#${uid}-arrow)`}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={active ? 1 - draw : 0}
              opacity={
                state.dim.has(link.from) && state.dim.has(link.to) ? 0.4 : 1
              }
            >
              <title>{`${state.nodes.find((n) => n.id === link.from)?.label} → ${state.nodes.find((n) => n.id === link.to)?.label}${link.label ? ": " + link.label : ""}`}</title>
            </path>
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
                fill="var(--diagram-muted)"
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
                  stroke="var(--diagram-grid)"
                  strokeDasharray={ratio ? "4 5" : undefined}
                />
                <text
                  x="49"
                  y={369 - ratio * 245}
                  textAnchor="end"
                  fill="var(--diagram-muted)"
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
          state.nodes
            .filter((node) => state.visible.has(node.id))
            .map((node) => (
              <DiagramNode
                key={node.id}
                node={node}
                position={positionById.get(node.id)}
                layout={state.layout}
                active={state.focus.has(node.id)}
                dim={state.dim.has(node.id)}
                compact={compact}
              />
            ))
        )}
      </svg>
      {visibleLinks.some((link) => link.label) && (
        <ul
          aria-label="Diagram relationships"
          className="mt-2 grid gap-1.5 border-t border-border/70 px-2 pt-3 text-[11px] leading-relaxed text-muted-foreground sm:grid-cols-2 sm:text-xs"
        >
          {visibleLinks
            .filter((link) => link.label)
            .map((link, index) => (
              <li key={index}>
                <span className="font-medium text-foreground">
                  {state.nodes.find((n) => n.id === link.from)?.label}
                  <span className="px-1 text-primary" aria-label="leads to">
                    →
                  </span>
                  {state.nodes.find((n) => n.id === link.to)?.label}
                </span>
                <span className="ml-1">· {link.label}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
