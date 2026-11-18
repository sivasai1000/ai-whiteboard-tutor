/** A bounded, reproducible teaching model. Phase is cycles relative to sunlight. */
export const MOON_LAYOUT = "moon-phases";
const MOON_NODE_LABELS = {
  sun: "Sun",
  earth: "Earth",
  moon: "Moon",
  view: "View from Earth",
};
export const MOON_NODE_IDS = Object.keys(MOON_NODE_LABELS);
const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const phaseFraction = (cycles) => ((cycles % 1) + 1) % 1;

export function moonGeometry(cycles) {
  const phase = phaseFraction(cycles);
  const angle = TAU * phase;
  return {
    phase,
    // North-side schematic: new at left, first quarter below, full at right.
    x: -Math.cos(angle),
    y: Math.sin(angle),
    illuminated: (1 - Math.cos(angle)) / 2,
    waxing: phase < 0.5,
  };
}

export function moonPhaseName(cycles) {
  const phase = phaseFraction(cycles);
  const near = (target) => Math.abs(phase - target) < 0.002;
  if (near(0) || phase > 0.998) return "New Moon";
  if (near(0.25)) return "First quarter";
  if (near(0.5)) return "Full Moon";
  if (near(0.75)) return "Third quarter";
  if (phase < 0.25) return "Waxing crescent";
  if (phase < 0.5) return "Waxing gibbous";
  if (phase < 0.75) return "Waning gibbous";
  return "Waning crescent";
}

/** Project a sphere's illuminated hemisphere, rather than sliding a circle mask. */
export function moonLitPath(cycles, radius = 1) {
  const { phase, waxing } = moonGeometry(cycles);
  const side = waxing ? 1 : -1;
  const terminator = Math.cos(TAU * phase);
  const points = [];
  for (let i = 0; i <= 80; i++) {
    const angle = -Math.PI / 2 + (Math.PI * i) / 80;
    points.push([
      side * terminator * Math.cos(angle) * radius,
      Math.sin(angle) * radius,
    ]);
  }
  for (let i = 80; i >= 0; i--) {
    const angle = -Math.PI / 2 + (Math.PI * i) / 80;
    points.push([side * Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return `M${points.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join("L")}Z`;
}

/** Rebuild each transition from data; no accumulating state or independent clock. */
export function resolveMoonPhase(
  scene,
  stepIndex = 0,
  cueProgress = 0,
  reducedMotion = false,
) {
  let previous =
    scene.visual.nodes.find((node) => node.id === "moon")?.value || 0;
  const index = clamp(stepIndex, 0, scene.steps.length - 1);
  for (let i = 0; i < index; i++) {
    const update = scene.steps[i].updates.find((node) => node.id === "moon");
    if (update) previous = update.value;
  }
  const target =
    scene.steps[index].updates.find((node) => node.id === "moon")?.value ??
    previous;
  // Settle before the spoken phrase finishes; reduced motion shows its end state.
  const t = reducedMotion ? 1 : clamp(cueProgress / 0.85, 0, 1);
  const eased = t * t * (3 - 2 * t);
  return previous + (target - previous) * eased;
}

export function checkMoonScene(scene) {
  const issues = [];
  const ids = scene.visual.nodes.map((node) => node.id);
  if (ids.length !== 4 || MOON_NODE_IDS.some((id) => !ids.includes(id)))
    issues.push("Moon scenes need exactly sun, earth, moon and view nodes.");
  if (
    scene.visual.nodes.some(
      (node) =>
        node.label !== MOON_NODE_LABELS[node.id] ||
        (node.id !== "moon" && node.value !== 0),
    )
  )
    issues.push(
      "Moon scene labels must match their objects; only the Moon has a phase value.",
    );
  if (scene.visual.links.length || scene.visual.unit)
    issues.push(
      "Moon scenes use calculated sunlight and sight lines, without custom links or units.",
    );
  let previous = scene.visual.nodes.find((node) => node.id === "moon")?.value;
  if (!Number.isFinite(previous) || previous < 0 || previous > 4)
    issues.push("Moon phase must be between zero and four cycles.");
  for (const step of scene.steps) {
    if (
      MOON_NODE_IDS.some((id) => !step.visible.includes(id)) ||
      step.dim.length
    )
      issues.push(
        "Keep all four Moon scene objects visible; use focus to explain them.",
      );
    for (const update of step.updates) {
      if (
        update.id !== "moon" ||
        update.label !== "Moon" ||
        update.value < previous ||
        update.value > 4 ||
        update.value - previous > 1
      )
        issues.push(
          "Moon motion must advance at most one cycle per phrase, within zero to four cycles.",
        );
      previous = update.value;
    }
  }
  return issues;
}

// This same contract reaches generation and independent review to prevent drift.
export const MOON_SCENE_CONTRACT = `The moon-phases layout is a calculated Sun–Earth–Moon simulation, ONLY for phases and reflected sunlight, not seasons, tides, rotation, or eclipses. Prefer it for Moon-phase topics. Use exactly four nodes with IDs sun, earth, moon, view, no links, empty unit. All four must be visible in every step; dim stays empty. Labels are Sun, Earth, Moon, and View from Earth. The moon node's value is the starting phase in cycles: 0=new, 0.125=waxing crescent, 0.25=first quarter, 0.375=waxing gibbous, 0.5=full, 0.625=waning gibbous, 0.75=third quarter, 0.875=waning crescent, 1=new again. Other values are zero. Only moon may be updated. Updates animate from the previous value to the supplied END value during that spoken phrase; values advance by at most one cycle, within 0..4. Keep the label Moon. Use moving narration (watch it move/grow/shrink) during transitions. For a named phase, arrive in a preceding transition step and hold it with empty updates while explaining that exact phase. Across chapters initialize the moon value at the previous end value unless deliberately introducing a new phase. The orbit view always lights the Moon's Sun-facing left half; the Earth-view inset computes the visible lit fraction as (1-cos(2*pi*phase))/2 and shows waxing on the right, a Northern Hemisphere convention. A phase is NOT Earth's shadow; eclipses are excluded, sizes/distances are not to scale, orbit tilt is not shown. Do not teach an eclipse using this layout. The 29.5-day PHASE cycle is not the 27.3-day orbital period. Focus sun for the light source, moon for its motion, earth for observer location, view for the apparent phase. Notes must match the shown phase or transition.`;
