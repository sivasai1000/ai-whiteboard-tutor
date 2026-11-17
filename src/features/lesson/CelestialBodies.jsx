import { useId } from "react";
import { moonLitPath } from "@/lib/moon-scene";

/** Local NASA imagery supplies texture; illumination is calculated by the renderer. */
export function MoonDisk({
  x = 0,
  y = 0,
  radius,
  phase = 0.5,
  schematic = false,
}) {
  const id = useId();
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`${id}-disk`}>
          <circle r={radius} />
        </clipPath>
        <clipPath id={`${id}-light`}>
          {schematic ? (
            <path
              d={`M0,${-radius} A${radius},${radius} 0 0 0 0,${radius} Z`}
            />
          ) : (
            <path d={moonLitPath(phase, radius)} />
          )}
        </clipPath>
        <radialGradient id={`${id}-sphere`} cx="25%" cy="35%" r="75%">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#65718a" />
        </radialGradient>
      </defs>
      <circle r={radius} fill="#172238" stroke="#4c5b73" strokeWidth="0.7" />
      <g clipPath={`url(#${id}-disk)`}>
        {!schematic && (
          <image
            href="/visuals/astronomy/moon.jpg"
            x={-1.176 * radius}
            y={-1.125 * radius}
            width={2.344 * radius}
            height={2.344 * radius}
            opacity="0.11"
          />
        )}
        <g clipPath={`url(#${id}-light)`}>
          {schematic ? (
            <circle r={radius} fill={`url(#${id}-sphere)`} />
          ) : (
            <image
              href="/visuals/astronomy/moon.jpg"
              x={-1.176 * radius}
              y={-1.125 * radius}
              width={2.344 * radius}
              height={2.344 * radius}
            />
          )}
        </g>
      </g>
    </g>
  );
}

export function EarthBody({ x, y, radius }) {
  const id = useId();
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`${id}-earth`}>
          <circle r={radius} />
        </clipPath>
        <linearGradient id={`${id}-night`}>
          <stop offset="0" stopColor="#071125" stopOpacity="0" />
          <stop offset="48%" stopColor="#071125" stopOpacity="0.1" />
          <stop offset="53%" stopColor="#071125" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#071125" stopOpacity="0.96" />
        </linearGradient>
      </defs>
      <circle r={radius + 3} fill="#519de5" opacity="0.15" />
      <circle r={radius} fill="#2572ac" />
      <g clipPath={`url(#${id}-earth)`}>
        <image
          href="/visuals/astronomy/earth.jpg"
          x={-radius * 1.02}
          y={-radius * 1.02}
          width={radius * 2.04}
          height={radius * 2.04}
        />
        <circle r={radius} fill={`url(#${id}-night)`} />
      </g>
      <circle
        r={radius}
        fill="none"
        stroke="#86b9e8"
        strokeOpacity="0.45"
        strokeWidth="0.7"
      />
    </g>
  );
}

export function SunBody({ x, y, radius }) {
  const id = useId();
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-sun`} cx="35%" cy="30%">
          <stop offset="0" stopColor="#fff5cb" />
          <stop offset="55%" stopColor="#ffd365" />
          <stop offset="90%" stopColor="#f59e30" />
          <stop offset="100%" stopColor="#d67a23" />
        </radialGradient>
      </defs>
      <circle r={radius * 2} fill={`url(#${id}-halo)`} />
      <circle r={radius} fill={`url(#${id}-sun)`} />
      {[
        [-0.35, -0.3, 0.14],
        [0.36, 0.2, 0.2],
        [-0.18, 0.48, 0.12],
        [0.4, -0.38, 0.09],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx * radius}
          cy={cy * radius}
          r={r * radius}
          fill="#fff7cc"
          opacity="0.16"
        />
      ))}
    </g>
  );
}
