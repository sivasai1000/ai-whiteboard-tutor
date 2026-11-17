import { MOON_NODE_IDS } from "./moon-scene.js";

/** Versioned preview: narration, measured cue files and visual states travel together. */
export const sampleTopic = "Why does the Moon change shape?";
export const sampleDescription =
  "Follow the sunlight. See the Moon from two perspectives.";
const visual = (phase) => ({
  layout: "moon-phases",
  caption: "One Moon. A changing view.",
  unit: "",
  nodes: [
    {
      id: "sun",
      label: "Sun",
      detail: "Our light source",
      value: 0,
      color: "amber",
      symbol: "sun",
    },
    {
      id: "earth",
      label: "Earth",
      detail: "Our observing position",
      value: 0,
      color: "teal",
      symbol: "earth",
    },
    {
      id: "moon",
      label: "Moon",
      detail: "Reflects sunlight",
      value: phase,
      color: "indigo",
      symbol: "none",
    },
    {
      id: "view",
      label: "View from Earth",
      detail: "The apparent illuminated shape",
      value: 0,
      color: "indigo",
      symbol: "none",
    },
  ],
  links: [],
});
const step = (narration, note, focus, endPhase) => ({
  narration,
  note,
  focus,
  visible: [...MOON_NODE_IDS],
  dim: [],
  updates:
    endPhase === undefined
      ? []
      : [{ id: "moon", label: "Moon", value: endPhase }],
});
const chapters = [
  {
    title: "The Moon borrows its light.",
    visual: visual(0.125),
    steps: [
      step(
        "Look at the Sun on the left. Its light travels toward Earth and the Moon.",
        "The Sun is the light source",
        ["sun"],
      ),
      step(
        "The Moon reflects sunlight. Away from eclipses, one half of its surface is always lit.",
        "Sun-facing half: lit · opposite half: dark",
        ["moon"],
      ),
      step(
        "Compare the orbit diagram with our view from Earth. We see only part of that illuminated half.",
        "Same Moon, two different perspectives",
        ["earth", "view"],
      ),
    ],
  },
  {
    title: "From new Moon to a crescent.",
    visual: visual(0),
    steps: [
      step(
        "At new Moon, the sunlit side faces away from Earth, so the visible disk appears dark.",
        "New Moon · the sunlit side faces away",
        ["view"],
      ),
      step(
        "Watch the Moon move around Earth. A growing sliver of its illuminated side comes into view.",
        "Moving from new Moon toward a crescent",
        ["moon", "view"],
        0.125,
      ),
      step(
        "This is a waxing crescent. Waxing means the illuminated part we can see is getting larger.",
        "Waxing = the visible lit part grows",
        ["view"],
      ),
    ],
  },
  {
    title: "First quarter, half a disk.",
    visual: visual(0.125),
    steps: [
      step(
        "Let the Moon move farther around Earth. Keep watching the bright shape in our Earth-view window.",
        "Follow the changing angle",
        ["moon", "view"],
        0.25,
      ),
      step(
        "At first quarter, half of the visible disk is illuminated, even though half the entire Moon remains sunlit.",
        "First quarter · 50% of the visible disk lit",
        ["view"],
      ),
      step(
        "The bright side appears on the right here. This illustration uses a Northern Hemisphere viewing orientation.",
        "Orientation matters: this is a northern view",
        ["view"],
      ),
    ],
  },
  {
    title: "The bright face comes into view.",
    visual: visual(0.25),
    steps: [
      step(
        "As the Moon continues around Earth, more of its illuminated side becomes visible, growing toward full Moon.",
        "Waxing: from half-lit toward fully lit",
        ["moon", "view"],
        0.5,
      ),
      step(
        "Now the Moon is opposite the Sun in our sky. Its visible disk is almost completely illuminated.",
        "Full Moon · the visible disk is lit",
        ["view"],
      ),
      step(
        "The Moon has not started glowing by itself. We are looking at the side that reflects sunlight.",
        "Moonlight is reflected sunlight",
        ["sun", "view"],
      ),
    ],
  },
  {
    title: "Then the bright shape shrinks.",
    visual: visual(0.5),
    steps: [
      step(
        "Continue around the orbit. The visible illuminated part now gets smaller, a change we call waning.",
        "Waning = the visible lit part shrinks",
        ["moon", "view"],
        0.75,
      ),
      step(
        "At third quarter, half the visible disk is illuminated again, now on the left in this view.",
        "Third quarter · the opposite half is lit",
        ["view"],
      ),
      step(
        "The Moon moves through a waning crescent and returns toward new Moon, ready to repeat the cycle.",
        "Through a crescent, back toward new Moon",
        ["moon", "view"],
        1,
      ),
    ],
  },
  {
    title: "A changing view, not a changing Moon.",
    visual: visual(1),
    steps: [
      step(
        "Watch one complete phase cycle: the bright shape grows, then shrinks. In nature, this takes about twenty-nine-and-a-half days.",
        "One phase cycle ≈ 29.5 days",
        ["moon", "view"],
        2,
      ),
      step(
        "Phases are not Earth's shadow. The Moon's tilted orbit usually prevents eclipses; our simplified diagram omits that tilt.",
        "Changing viewpoint causes phases, not Earth's shadow",
        ["earth", "view"],
      ),
      step(
        "Remember: sunlight illuminates half the Moon, while its position changes how much of that half we see.",
        "Sunlight + changing viewpoint = Moon phases",
        ["sun", "moon", "view"],
      ),
    ],
  },
];
export const sampleScenes = chapters.map((scene, index) => ({
  ...scene,
  id: `moon-phases-v1-${index + 1}`,
  narration: scene.steps.map((step) => step.narration).join(" "),
  duration: 22,
  sampleAudioUrl: `/sample/moon-phases-v1/scene-${index + 1}.m4a`,
  sampleCuesUrl: `/sample/moon-phases-v1/scene-${index + 1}.json`,
}));
export function createSampleLesson() {
  return {
    id: crypto.randomUUID(),
    topic: sampleTopic,
    title: sampleTopic,
    summary:
      "Explore reflected sunlight, new Moon, crescents, quarter phases and full Moon using a synchronized orbital model and Earth-view illustration.",
    level: "Beginner",
    source: "sample",
    formatVersion: 3,
    createdAt: new Date().toISOString(),
    saved: false,
    messages: [],
    scenes: structuredClone(sampleScenes),
  };
}
