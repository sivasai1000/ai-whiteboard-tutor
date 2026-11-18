import {
  Droplets,
  Cloud,
  CloudRain,
  Leaf,
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
import { EarthBody, SunBody, MoonDisk } from "./CelestialBodies";
import { hasIllustration } from "@/lib/visual-symbols";

const icons = {
  water: Droplets,
  cloud: Cloud,
  rain: CloudRain,
  leaf: Leaf,
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

function Animal({ name }) {
  if (name === "lion" || name === "lioness")
    return (
      <>
        <path
          d="M71 60 Q96 40 91 68"
          fill="none"
          stroke="#bb7b28"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M90 65 Q98 63 96 72 Q88 73 90 65" fill="#80542b" />
        <ellipse cx="57" cy="61" rx="29" ry="20" fill="#e5af4f" />
        <path d="M48 70 V87 H40 V68 M72 71 V87 H64 V69" fill="#d59a3c" />
        {name === "lion" && (
          <>
            <circle cx="28" cy="46" r="26" fill="#9a592d" />
            <circle cx="28" cy="46" r="20" fill="#b67434" />
          </>
        )}
        <circle cx="17" cy="31" r="6" fill="#e5af4f" />
        <circle cx="39" cy="31" r="6" fill="#e5af4f" />
        <ellipse cx="28" cy="47" rx="16" ry="18" fill="#f0c86d" />
        <ellipse cx="28" cy="55" rx="10" ry="8" fill="#fff0c6" />
        <circle cx="22" cy="43" r="2" fill="#362c28" />
        <circle cx="34" cy="43" r="2" fill="#362c28" />
        <path
          d="M24 51 H32 L28 56 Z M28 55 V60"
          fill="#63412c"
          stroke="#63412c"
          strokeWidth="1.5"
        />
      </>
    );
  if (name === "mouse")
    return (
      <>
        <path
          d="M66 66 Q98 63 87 38"
          fill="none"
          stroke="#d59aaa"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="49" cy="62" rx="30" ry="21" fill="#9ba5b6" />
        <ellipse cx="29" cy="58" rx="19" ry="17" fill="#b9c1ce" />
        <circle cx="26" cy="39" r="14" fill="#a6afbe" />
        <circle cx="26" cy="39" r="9" fill="#e1b8c1" />
        <circle cx="19" cy="55" r="2.5" fill="#283347" />
        <circle cx="10" cy="63" r="3" fill="#d08ea2" />
        <path
          d="M15 65 L1 61 M15 68 L2 70"
          stroke="#667085"
          strokeWidth="1.3"
        />
        <ellipse cx="38" cy="82" rx="8" ry="3" fill="#d59aaa" />
        <ellipse cx="66" cy="80" rx="8" ry="3" fill="#d59aaa" />
      </>
    );
  const zebra = name === "zebra",
    buffalo = name === "buffalo";
  const body = zebra ? "#f4f5f6" : buffalo ? "#5b5250" : "#c68c50";
  const dark = zebra ? "#333c48" : buffalo ? "#352f30" : "#855732";
  return (
    <>
      <path
        d="M77 47 Q91 50 90 65"
        fill="none"
        stroke={dark}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse
        cx="55"
        cy="53"
        rx="29"
        ry={buffalo ? 23 : 17}
        fill={body}
        stroke={dark}
        strokeWidth="1"
      />
      <path
        d="M39 62 L36 88 H42 L47 62 M66 62 L68 88 H74 L75 60"
        fill={body}
        stroke={dark}
        strokeWidth="1.5"
      />
      <path
        d="M30 52 L21 29 L32 23 L45 46"
        fill={body}
        stroke={dark}
        strokeWidth="1"
      />
      <ellipse cx="25" cy="28" rx="15" ry="10" fill={body} />
      {zebra ? (
        <>
          <path
            d="M43 39 L48 65 M55 37 L60 68 M67 39 L72 63 M27 34 L35 49 M18 22 L31 28"
            stroke="#343e4a"
            strokeWidth="4"
          />
          <path d="M31 21 L36 38" stroke="#343e4a" strokeWidth="6" />
          <path d="M19 20 L18 8 L24 19 M29 19 L34 8 L34 23" fill="#343e4a" />
        </>
      ) : buffalo ? (
        <path
          d="M16 23 Q4 19 9 8 Q13 19 25 19 Q37 19 41 8 Q46 21 34 24"
          fill="#d8c4a5"
          stroke="#70604e"
          strokeWidth="1.5"
        />
      ) : (
        <>
          <path
            d="M25 20 Q18 6 23 0 M32 20 Q35 7 30 0"
            fill="none"
            stroke="#594230"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M15 22 L6 14 L21 20" fill="#c68c50" />
          <ellipse cx="53" cy="60" rx="19" ry="8" fill="#f3d9ac" />
        </>
      )}
      <circle cx="19" cy="27" r="2" fill={zebra ? "#18222e" : "#fff4dc"} />
      <ellipse cx="12" cy="32" rx="6" ry="4" fill={dark} />
      <path
        d="M35 88 H43 M67 88 H75"
        stroke={dark}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  );
}

export function DiagramSymbol({ name, x, y, color, size = 24 }) {
  const Icon = icons[name];
  if (!hasIllustration({ symbol: name }))
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
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      overflow="visible"
    >
      {name === "sun" ? (
        <SunBody x={50} y={50} radius={30} />
      ) : name === "earth" ? (
        <EarthBody x={50} y={50} radius={37} />
      ) : name === "moon" ? (
        <MoonDisk x={50} y={50} radius={37} phase={0.5} />
      ) : name === "grass" ? (
        <>
          <path
            d="M14 86 Q20 47 5 31 Q34 40 35 84 Q33 31 23 10 Q49 32 49 82 Q51 34 72 15 Q61 52 63 85 Q75 49 94 40 Q78 65 83 88 Z"
            fill="#69a66c"
          />
          <path
            d="M35 86 Q37 52 31 31 M51 86 Q56 52 65 34 M68 88 Q76 63 85 56"
            stroke="#35804c"
            strokeWidth="3"
            fill="none"
          />
        </>
      ) : name === "vulture" ? (
        <>
          <ellipse cx="56" cy="59" rx="27" ry="28" fill="#554b46" />
          <path d="M51 37 Q77 38 83 77 L57 89 Q36 69 51 37" fill="#302f32" />
          <path d="M39 53 Q22 43 28 25 L36 26 Q29 42 46 46" fill="#d8bcb0" />
          <ellipse cx="31" cy="23" rx="11" ry="13" fill="#dec4b9" />
          <path d="M23 22 Q8 24 12 35 L25 30" fill="#b29562" />
          <circle cx="28" cy="20" r="2.3" fill="#202938" />
          <path d="M35 45 L27 49 L38 58 L49 50" fill="#ece6d8" />
          <path d="M46 83 V94 M61 84 V94" stroke="#b39d75" strokeWidth="3" />
        </>
      ) : name === "tree" ? (
        <>
          <path d="M44 48 H56 V92 H44 Z" fill="#8d6243" />
          <circle cx="50" cy="28" r="23" fill="#418b61" />
          <circle cx="29" cy="48" r="22" fill="#5ca877" />
          <circle cx="69" cy="46" r="25" fill="#3b9466" />
          <path
            d="M50 60 V32 M50 52 L31 42 M50 58 L67 43"
            stroke="#31734d"
            strokeWidth="3"
            fill="none"
          />
        </>
      ) : name === "flower" ? (
        <>
          <path
            d="M50 43 V92 M50 78 Q17 77 28 60 Q48 61 50 78 M50 67 Q79 67 76 51 Q53 52 50 67"
            stroke="#459363"
            fill="#6daf7a"
            strokeWidth="3"
          />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="50"
              cy="20"
              rx="10"
              ry="17"
              fill="#df90b5"
              transform={`rotate(${angle} 50 37)`}
            />
          ))}
          <circle cx="50" cy="37" r="12" fill="#f6c45c" />
        </>
      ) : name === "fish" ? (
        <>
          <path d="M67 49 L94 27 V76 Z" fill="#e7a347" />
          <ellipse cx="40" cy="51" rx="34" ry="24" fill="#f1be63" />
          <path d="M37 49 L54 66 L31 63 Z" fill="#dc8d36" />
          <circle cx="20" cy="46" r="4" fill="#374151" />
          <path
            d="M29 33 Q40 50 29 70"
            fill="none"
            stroke="#ce8737"
            strokeWidth="2"
          />
        </>
      ) : name === "bird" ? (
        <>
          <path d="M56 58 L89 82 L80 52" fill="#4773a4" />
          <ellipse cx="48" cy="54" rx="27" ry="23" fill="#75a9cd" />
          <circle cx="28" cy="36" r="17" fill="#82b9dc" />
          <path d="M13 35 L0 42 L16 44" fill="#d89e45" />
          <path d="M39 43 Q82 31 60 68 Q40 67 39 43" fill="#4e85b4" />
          <circle cx="23" cy="33" r="2.7" fill="#24324b" />
          <path
            d="M40 76 L37 89 M52 75 L50 89"
            stroke="#a66d32"
            strokeWidth="3"
          />
        </>
      ) : (
        <Animal name={name} />
      )}
    </svg>
  );
}
