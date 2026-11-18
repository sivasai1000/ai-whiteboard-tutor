import { ArrowUpRight, Play, LoaderCircle } from "lucide-react";
import {
  SunBody,
  EarthBody,
  MoonDisk,
} from "@/features/lesson/CelestialBodies";
import { sampleTopic, sampleDescription } from "@/lib/sample-lesson";
import { samplePreviewStyles as s } from "./style";

export function SamplePreview({ onOpen, onPrepare, opening, disabled }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={onPrepare}
      onFocus={onPrepare}
      aria-busy={opening}
      disabled={disabled}
      className={s.card}
      aria-label={`Play sample lesson: ${sampleTopic}`}
    >
      <span className={s.art} aria-hidden="true">
        <svg viewBox="0 0 360 210" className={s.thumbnail}>
          <text x="22" y="29" fill="#a7b6ce" fontSize="10" letterSpacing="1.5">
            FOLLOW THE LIGHT
          </text>
          <circle
            cx="152"
            cy="116"
            r="58"
            fill="none"
            stroke="#596880"
            strokeDasharray="3 5"
          />
          <SunBody x={44} y={116} radius={23} />
          <path d="M78 116 H119 m-5 -4 5 4 -5 4" stroke="#f8ca78" fill="none" />
          <EarthBody x={152} y={116} radius={22} />
          <MoonDisk x={152} y={174} radius={11} schematic />
          <path d="M220 60 V179" stroke="#334155" />
          <MoonDisk x={284} y={113} radius={43} phase={0.25} />
          <text
            x="284"
            y="179"
            textAnchor="middle"
            fill="#b9c7dc"
            fontSize="11"
          >
            Our view from Earth
          </text>
        </svg>
        <span className={s.play}>
          <Play className="ml-0.5 size-3 fill-current" />
        </span>
      </span>
      <span className={s.content}>
        <span className={s.eyebrow}>
          Sample lesson <span aria-hidden="true">·</span> 2 min
        </span>
        <span className={s.title}>{sampleTopic}</span>
        <span className={s.description}>{sampleDescription}</span>
        <span className={s.action} role={opening ? "status" : undefined}>
          {opening ? (
            <>
              Opening preview…{" "}
              <LoaderCircle className="size-3.5 motion-safe:animate-spin" />
            </>
          ) : (
            <>
              Play preview{" "}
              <ArrowUpRight className="size-3.5 transition-transform motion-reduce:transform-none group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </>
          )}
        </span>
      </span>
    </button>
  );
}
