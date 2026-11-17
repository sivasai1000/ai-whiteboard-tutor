"use client";

import { useId, useState, useEffect, useRef } from "react";
import { Minus, PenLine, Plus, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { boardColors, lessonStyles as s } from "./style";
import { visibleElements } from "./timeline";
import { MoonPhaseScene } from "./MoonPhaseScene";
import { MOON_LAYOUT } from "@/lib/moon-scene";
import { VisualDiagram } from "./VisualDiagram";
import { shapeLabelPosition } from "./diagram-layout";

function DiagramElement({ element, elements, progress, markerId }) {
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
    const { x: labelX, y: labelY } = shapeLabelPosition(element, elements);
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

export function Whiteboard({
  scene,
  progress,
  stepIndex = 0,
  elapsed = 0,
  cueProgress = 0,
  fullscreen,
  onToggleFullscreen,
  children,
}) {
  const uid = useId().replaceAll(":", "");
  const [zoom, setZoom] = useState(1);
  const viewport = useRef(null);
  const [compact, setCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setCompact(entry.contentRect.width < 620),
    );
    observer.observe(viewport.current);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReducedMotion(media.matches);
    change();
    media.addEventListener("change", change);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", change);
    };
  }, []);
  const Diagram =
    scene.visual?.layout === MOON_LAYOUT ? MoonPhaseScene : VisualDiagram;
  const zoomClass = {
    1: "w-full",
    1.5: "w-[150%] min-w-[720px]",
    2: "w-[200%] min-w-[960px]",
  }[zoom];
  return (
    <div className={s.boardShell} data-testid="whiteboard">
      <div className={s.boardHeader}>
        <div className={s.boardNote}>
          <span className={s.boardMark}>
            <PenLine className="size-3.5" />
          </span>
          <span className="max-[360px]:hidden">Whiteboard</span>
          {scene.steps && (
            <span className={s.boardStep}>
              Step {stepIndex + 1} / {scene.steps.length}
            </span>
          )}
        </div>
        <div className={s.boardControls}>
          <Button
            variant="ghost"
            size="icon"
            className={s.boardButton}
            title="Zoom out"
            aria-label="Zoom out of whiteboard"
            disabled={zoom === 1}
            onClick={() => setZoom((value) => value - 0.5)}
          >
            <Minus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={s.fitButton}
            aria-label="Fit whiteboard to screen"
            title="Fit drawing to the board"
            onClick={() => setZoom(1)}
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={s.boardButton}
            title="Zoom in"
            aria-label="Zoom into whiteboard"
            disabled={zoom === 2}
            onClick={() => setZoom((value) => value + 0.5)}
          >
            <Plus className="size-3.5" />
          </Button>
          <span className={s.fullscreenButton}>
            <Button
              variant="ghost"
              size="icon"
              className={s.boardButton}
              title={fullscreen ? "Exit fullscreen (Esc)" : "Open fullscreen"}
              aria-label={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
              aria-pressed={Boolean(fullscreen)}
              onClick={onToggleFullscreen}
            >
              {fullscreen ? (
                <Minimize className="size-3.5" />
              ) : (
                <Maximize className="size-3.5" />
              )}
            </Button>
          </span>
        </div>
      </div>
      <div
        ref={viewport}
        className={cn(
          s.boardViewport,
          scene.visual?.layout === MOON_LAYOUT && s.simulationViewport,
        )}
        tabIndex={zoom > 1 ? 0 : undefined}
        role={zoom > 1 ? "region" : undefined}
        aria-label={
          zoom > 1
            ? "Zoomed whiteboard. Scroll to explore the diagram."
            : undefined
        }
      >
        {scene.visual ? (
          <div
            className={cn(
              s.diagramFrame,
              zoomClass,
              zoom === 1 && s.diagramFrameFit,
            )}
          >
            <Diagram
              cueProgress={cueProgress}
              scene={scene}
              stepIndex={stepIndex}
              compact={compact && zoom === 1}
              elapsed={elapsed}
              reducedMotion={reducedMotion}
              className={
                zoom === 1
                  ? fullscreen
                    ? s.diagramFullscreen
                    : s.diagramFit
                  : undefined
              }
            />
          </div>
        ) : (
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
                <circle
                  cx={1}
                  cy={1}
                  r={0.7}
                  fill={boardColors.muted}
                  opacity={0.2}
                />
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
                elements={scene.elements}
                progress={progress}
                markerId={uid}
              />
            ))}
          </svg>
        )}
      </div>
      {children}
    </div>
  );
}
