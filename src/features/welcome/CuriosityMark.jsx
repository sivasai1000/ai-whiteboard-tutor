export function CuriosityMark() {
  return (
    <svg
      viewBox="0 0 100 76"
      fill="none"
      className="h-16 w-24 text-primary"
      aria-hidden="true"
    >
      <ellipse
        cx="50"
        cy="38"
        rx="41"
        ry="15"
        transform="rotate(-32 50 38)"
        stroke="currentColor"
        strokeOpacity=".24"
      />
      <ellipse
        cx="50"
        cy="38"
        rx="41"
        ry="15"
        transform="rotate(32 50 38)"
        stroke="currentColor"
        strokeOpacity=".24"
      />
      <path
        d="m50 20 4.9 13.1L68 38l-13.1 4.9L50 56l-4.9-13.1L32 38l13.1-4.9Z"
        fill="currentColor"
      />
      <circle cx="81" cy="18" r="3" fill="currentColor" />
      <circle cx="18" cy="56" r="2.5" fill="currentColor" fillOpacity=".5" />
      <circle cx="81" cy="58" r="1.5" fill="currentColor" fillOpacity=".4" />
    </svg>
  );
}

export function SampleIllustration() {
  return (
    <svg
      viewBox="0 0 128 90"
      className="h-20 w-28 shrink-0 rounded-lg bg-background"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="64"
        cy="45"
        rx="44"
        ry="25"
        stroke="#74717e"
        strokeOpacity=".35"
        strokeDasharray="3 4"
      />
      <circle
        cx="64"
        cy="45"
        r="12"
        fill="#e4b778"
        fillOpacity=".16"
        stroke="#e4b778"
        strokeOpacity=".85"
      />
      <circle cx="64" cy="45" r="7" fill="#e4b778" fillOpacity=".7" />
      <circle cx="27" cy="32" r="7" fill="#222c33" stroke="#8ac5d6" />
      <path d="m24 25 6 14" stroke="#8ac5d6" strokeWidth="1.5" />
      <path d="m92 60 5-1-1 5" stroke="#a78bfa" strokeLinecap="round" />
      <circle cx="103" cy="32" r="2" fill="#a78bfa" fillOpacity=".6" />
    </svg>
  );
}
