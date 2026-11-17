"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import {
  moonGeometry,
  moonPhaseName,
  resolveMoonPhase,
} from "@/lib/moon-scene";
import { resolveVisualStep } from "@/lib/visual-lesson";
import { EarthBody, MoonDisk, SunBody } from "./CelestialBodies";
import { wrapLabel } from "./visual-layout";
import { moonSceneStyles as s } from "./style";

function FocusRing({ x, y, radius, active }) {
  return active ? (
    <circle
      cx={x}
      cy={y}
      r={radius + 8}
      fill="none"
      stroke="#a5b9ff"
      strokeWidth="1.5"
      strokeDasharray="3 4"
    />
  ) : null;
}

export function MoonPhaseScene({
  scene,
  stepIndex,
  cueProgress,
  compact,
  reducedMotion,
  className,
}) {
  const id = useId();
  const state = resolveVisualStep(scene, stepIndex);
  const phase = resolveMoonPhase(scene, stepIndex, cueProgress, reducedMotion);
  const geometry = moonGeometry(phase);
  const width = compact ? 480 : 960;
  const height = compact ? 800 : 510;
  const orbit = {
    x: compact ? 278 : 320,
    y: compact ? 220 : 240,
    radius: compact ? 122 : 145,
  };
  const sun = { x: compact ? 63 : 70, y: orbit.y, radius: compact ? 30 : 36 };
  const moon = {
    x: orbit.x + geometry.x * orbit.radius,
    y: orbit.y + geometry.y * orbit.radius,
  };
  const inset = {
    x: compact ? 240 : 755,
    y: compact ? 549 : 250,
    radius: compact ? 76 : 88,
  };
  const name = moonPhaseName(phase);
  const lit = Math.round(geometry.illuminated * 100);
  const noteLines = wrapLabel(state.note, compact ? 43 : 86, 2);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn(s.canvas, compact && s.compact, className)}
      role="img"
      aria-label={`${scene.title}. ${name}. ${lit} percent of the visible Moon disk is illuminated. ${state.note}`}
      data-visual-layout="moon-phases"
      data-step={stepIndex}
      data-phase={phase.toFixed(6)}
      data-illuminated={geometry.illuminated.toFixed(6)}
    >
      <title>{scene.title}</title>
      <desc>
        Sunlight comes from the left. The orbit is a simplified schematic; the
        inset shows the Moon from Earth using a Northern Hemisphere orientation.
        Sizes and distances are not to scale. Eclipses and orbit tilt are not
        modeled.
      </desc>
      <defs>
        <radialGradient id={`${id}-space`} cx="28%" cy="35%" r="90%">
          <stop offset="0" stopColor="#172741" />
          <stop offset="1" stopColor="#0b1222" />
        </radialGradient>
        <marker
          id={`${id}-arrow`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path
            d="M1 1 L8 5 L1 9"
            fill="none"
            stroke="#f7cc79"
            strokeWidth="1.5"
          />
        </marker>
      </defs>
      <rect width={width} height={height} fill={`url(#${id}-space)`} />
      {Array.from({ length: 36 }, (_, i) => (
        <circle
          key={i}
          cx={20 + ((i * 137) % (width - 40))}
          cy={70 + ((i * 83) % (height - 130))}
          r={i % 4 === 0 ? 1 : 0.6}
          fill="#bdd0ef"
          opacity={0.12 + (i % 3) * 0.08}
        />
      ))}
      <text x="28" y="35" className={s.eyebrow}>
        SUNLIGHT &amp; PERSPECTIVE
      </text>
      <text x="28" y="60" className={s.caption}>
        {state.caption}
      </text>
      {!compact && <line x1="568" y1="89" x2="568" y2="410" stroke="#29364d" />}
      {compact && <line x1="28" y1="405" x2="452" y2="405" stroke="#29364d" />}
      <circle
        cx={orbit.x}
        cy={orbit.y}
        r={orbit.radius}
        fill="none"
        stroke="#61738d"
        strokeOpacity="0.6"
        strokeDasharray="3 6"
      />
      {[0, 0.25, 0.5, 0.75].map((value) => {
        const g = moonGeometry(value);
        return (
          <circle
            key={value}
            cx={orbit.x + g.x * orbit.radius}
            cy={orbit.y + g.y * orbit.radius}
            r="3"
            fill="#61738d"
          />
        );
      })}
      <text
        x={orbit.x}
        y={compact ? 383 : 430}
        textAnchor="middle"
        className={s.small}
      >
        Orbit schematic · light from the left
      </text>
      <g data-node-id="sun" data-focused={state.focus.has("sun")}>
        <SunBody {...sun} />
        <FocusRing {...sun} active={state.focus.has("sun")} />
        <text
          x={sun.x}
          y={sun.y + sun.radius + 29}
          textAnchor="middle"
          className={s.label}
        >
          Sun
        </text>
        {[-56, 0, 56].map((dy) => (
          <line
            key={dy}
            x1={sun.x + 48}
            y1={sun.y + dy}
            x2={orbit.x - 48}
            y2={sun.y + dy}
            stroke="#f7cc79"
            strokeWidth="1"
            strokeOpacity={dy === 0 ? 0.65 : 0.32}
            markerEnd={`url(#${id}-arrow)`}
          />
        ))}
      </g>
      <line
        x1={orbit.x}
        y1={orbit.y}
        x2={moon.x}
        y2={moon.y}
        stroke="#a3b8f3"
        strokeWidth="1"
        strokeDasharray="4 5"
        opacity="0.4"
      />
      <g data-node-id="earth" data-focused={state.focus.has("earth")}>
        <EarthBody x={orbit.x} y={orbit.y} radius={compact ? 31 : 37} />
        <FocusRing
          x={orbit.x}
          y={orbit.y}
          radius={compact ? 31 : 37}
          active={state.focus.has("earth")}
        />
        <text
          x={orbit.x}
          y={orbit.y + 63}
          textAnchor="middle"
          className={s.label}
        >
          Earth
        </text>
      </g>
      <g data-node-id="moon" data-focused={state.focus.has("moon")}>
        <MoonDisk {...moon} radius={18} schematic />
        <FocusRing {...moon} radius={18} active={state.focus.has("moon")} />
        <text
          x={moon.x}
          y={moon.y < orbit.y - orbit.radius / 2 ? moon.y + 40 : moon.y - 34}
          textAnchor="middle"
          className={s.label}
        >
          Moon
        </text>
      </g>
      <g data-node-id="view" data-focused={state.focus.has("view")}>
        <text
          x={inset.x}
          y={compact ? 438 : 111}
          textAnchor="middle"
          className={s.eyebrow}
        >
          VIEW FROM EARTH
        </text>
        <MoonDisk {...inset} phase={phase} />
        <FocusRing {...inset} active={state.focus.has("view")} />
        <text
          x={inset.x}
          y={inset.y + inset.radius + 37}
          textAnchor="middle"
          className={s.phaseName}
        >
          {name}
        </text>
        <text
          x={inset.x}
          y={inset.y + inset.radius + 61}
          textAnchor="middle"
          className={s.small}
        >
          {lit}% of the visible disk lit
        </text>
        <text
          x={inset.x}
          y={compact ? 710 : 431}
          textAnchor="middle"
          className={s.fine}
        >
          Northern Hemisphere orientation
        </text>
      </g>
      <text
        x={width / 2}
        y={height - (compact ? 57 : 45)}
        textAnchor="middle"
        className={s.takeaway}
      >
        {noteLines.map((line, index) => (
          <tspan key={index} x={width / 2} dy={index ? 21 : 0}>
            {line}
          </tspan>
        ))}
      </text>
      <text
        x={width / 2}
        y={height - 15}
        textAnchor="middle"
        className={s.fine}
      >
        Not to scale · orbit tilt and eclipses omitted
      </text>
    </svg>
  );
}
