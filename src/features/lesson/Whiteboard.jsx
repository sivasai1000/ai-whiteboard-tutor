"use client";

import { useId, useState } from "react";
import { Minus, PenLine, Plus, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { boardColors, lessonStyles as s } from "./style";
import { visibleElements } from "./timeline";

function DiagramElement({ element, progress, markerId }) {
  const { type, x, y, width, height, text, appearAt } = element;
  const color = boardColors[element.color] || boardColors.white;
  const reveal = Math.min(1, Math.max(0, (progress - appearAt) / 0.035));
  const common = {
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (type === "text" || type === "equation") {
    const lines = String(text).split("\n").slice(0, 4);
    return (
      <text
        x={x}
        y={y}
        fill={color}
        textAnchor="middle"
        fontSize={type === "equation" ? 34 : 21}
        fontWeight={type === "equation" ? 500 : 400}
        fontFamily={type === "equation" ? "Georgia, serif" : "inherit"}
        opacity={0.5 + reveal * 0.5}
      >
        {lines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? 0 : 28}>
            {line}
          </tspan>
        ))}
      </text>
    );
  }
  if (type === "circle" || type === "rect") {
    const labelX = type === "circle" ? x : x + width / 2;
    const labelY = type === "circle" ? y : y + height / 2;
    return (
      <g>
        {type === "circle" ? (
          <circle
            cx={x}
            cy={y}
            r={width / 2}
            fill={color}
            fillOpacity={0.09}
            {...common}
          />
        ) : (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={14}
            fill={color}
            fillOpacity={0.055}
            {...common}
          />
        )}
        {text && (
          <text
            x={labelX}
            y={labelY}
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={20}
          >
            {text}
          </text>
        )}
      </g>
    );
  }
  return (
    <line
      x1={x}
      y1={y}
      x2={x + width}
      y2={y + height}
      {...common}
      markerEnd={
        type === "arrow" ? `url(#${markerId}-${element.color})` : undefined
      }
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - reveal}
    />
  );
}

export function Whiteboard({ scene, progress }) {
  const uid = useId().replaceAll(":", "");
  const [zoom, setZoom] = useState(1);
  const zoomClass = {
    1: "w-full",
    1.5: "w-[150%] min-w-[720px]",
    2: "w-[200%] min-w-[960px]",
  }[zoom];
  return (
    <div className={s.boardShell} data-testid="whiteboard">
      <div
        className={cn(s.boardNote, "z-10 rounded bg-[#141419]/90 px-1.5 py-1")}
      >
        <PenLine className="size-3" /> THE WHITEBOARD
      </div>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-lg border border-border bg-card/95 p-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Zoom out of whiteboard"
          disabled={zoom === 1}
          onClick={() => setZoom((value) => value - 0.5)}
        >
          <Minus className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Fit whiteboard to screen"
          onClick={() => setZoom(1)}
        >
          <Scan className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Zoom into whiteboard"
          disabled={zoom === 2}
          onClick={() => setZoom((value) => value + 0.5)}
        >
          <Plus className="size-3" />
        </Button>
      </div>
      <div
        className="flex h-full min-h-64 w-full items-center overflow-auto overscroll-contain pt-10 sm:min-h-80"
        tabIndex={zoom > 1 ? 0 : undefined}
        role={zoom > 1 ? "region" : undefined}
        aria-label={
          zoom > 1
            ? "Zoomed whiteboard. Scroll to explore the diagram."
            : undefined
        }
      >
        <svg
          viewBox="0 0 960 540"
          role="img"
          aria-label={`${scene.title}. ${scene.elements
            .filter((element) => element.text && element.appearAt <= progress)
            .map((element) => element.text)
            .join(". ")}`}
          className={cn(
            s.board,
            zoomClass,
            zoom > 1 && "h-auto max-h-none shrink-0",
          )}
        >
          <title>{scene.title}</title>
          <defs>
            <pattern
              id={`${uid}-dots`}
              x={0}
              y={0}
              width={28}
              height={28}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={1} cy={1} r={0.7} fill="#ffffff" opacity={0.07} />
            </pattern>
            {Object.entries(boardColors).map(([name, color]) => (
              <marker
                key={name}
                id={`${uid}-${name}`}
                viewBox="0 0 10 10"
                refX={8}
                refY={5}
                markerWidth={7}
                markerHeight={7}
                orient="auto-start-reverse"
              >
                <path
                  d="M 1 1 L 8 5 L 1 9"
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
            ))}
          </defs>
          <rect width={960} height={540} fill={`url(#${uid}-dots)`} />
          {visibleElements(scene, progress).map((element) => (
            <DiagramElement
              key={`${scene.id}-${element.id}`}
              element={element}
              progress={progress}
              markerId={uid}
            />
          ))}
        </svg>
      </div>
      <span className="absolute bottom-3 right-4 pointer-events-none text-[9px] text-muted-foreground/50 sm:hidden">
        {zoom === 1
          ? "Zoom in to explore"
          : `${Math.round(zoom * 100)}% · Scroll to explore`}
      </span>
    </div>
  );
}
