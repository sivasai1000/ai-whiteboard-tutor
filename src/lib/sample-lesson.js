/** A disclosed, prewritten preview. New topics always go through the real AI API. */
export const sampleTopic = "Why do we have seasons?";

function element(
  id,
  type,
  x,
  y,
  width,
  height,
  text = "",
  color = "white",
  appearAt = 0,
) {
  return { id, type, x, y, width, height, text, color, appearAt, points: "" };
}
const text = (id, x, y, value, color = "white", appearAt = 0) =>
  element(id, "text", x, y, 0, 0, value, color, appearAt);
const sun = [
  element("sun-halo", "circle", 480, 270, 130, 130, "", "amber"),
  element("sun", "circle", 480, 270, 92, 92, "", "amber"),
  text("sun-label", 480, 352, "THE SUN", "amber"),
];
const earth = (x, y, label, at = 0) => [
  element(`earth-${label}`, "circle", x, y, 58, 58, "", "cyan", at),
  element(`axis-${label}`, "line", x - 18, y + 44, 36, -88, "", "white", at),
  text(`label-${label}`, x, y + 75, label, "muted", at),
];

export const sampleScenes = [
  {
    id: "seasons-1",
    title: "A small tilt. A big difference.",
    duration: 21,
    narration:
      "Why does the same place feel warm in July and cold in January? The answer begins with a small tilt. Earth travels around the Sun, but its axis is tilted about twenty-three and a half degrees. That tilt changes how sunlight reaches us.",
    elements: [
      ...sun,
      ...earth(200, 270, "EARTH"),
      element("sunlight", "arrow", 392, 270, -128, 0, "", "amber", 0.12),
      text("tilt", 220, 165, "23.5°", "violet", 0.47),
      text("callout", 735, 230, "The secret is the tilt.", "violet", 0.65),
      text("callout-sub", 735, 268, "Not the distance.", "muted", 0.8),
      text("footer", 480, 457, "ONE ORBIT  ≈  ONE YEAR", "muted", 0.9),
    ],
  },
  {
    id: "seasons-2",
    title: "Meet Earth's tilted axis",
    duration: 18,
    narration:
      "Imagine a line running through the North and South Poles. This is Earth's axis, the line it spins around. As Earth completes its yearly orbit, the axis keeps pointing in nearly the same direction in space. It does not tip back and forth each season.",
    elements: [
      element("earth", "circle", 440, 270, 220, 220, "", "cyan"),
      element("equator", "line", 336, 230, 208, 80, "", "cyan", 0.1),
      element("axis", "line", 372, 435, 136, -330, "", "white", 0.15),
      text("north", 575, 120, "NORTH POLE", "muted", 0.2),
      text("south", 268, 428, "SOUTH POLE", "muted", 0.25),
      text("angle", 615, 215, "23.5° tilt", "violet", 0.43),
      text("note", 480, 495, "Same direction. All year.", "white", 0.68),
    ],
  },
  {
    id: "seasons-3",
    title: "Tilt toward the Sun → summer",
    duration: 20,
    narration:
      "When the Northern Hemisphere tilts toward the Sun, sunlight hits it more directly. The same amount of solar energy is concentrated over a smaller area. Days are also longer, giving the ground more time to warm up. Together, these effects produce northern summer.",
    elements: [
      element("earth", "circle", 650, 280, 190, 190, "", "cyan"),
      element("axis", "line", 700, 405, -100, -250, "", "white"),
      element("sun", "circle", 190, 250, 95, 95, "", "amber"),
      element("ray-1", "arrow", 270, 210, 290, 0, "", "amber", 0.08),
      element("ray-2", "arrow", 270, 250, 290, 0, "", "amber", 0.16),
      element("ray-3", "arrow", 270, 290, 290, 0, "", "amber", 0.24),
      text("energy", 420, 160, "More direct sunlight", "amber", 0.38),
      text("summer", 665, 95, "NORTHERN SUMMER", "violet", 0.05),
      text(
        "days",
        480,
        460,
        "Longer days  +  concentrated energy",
        "white",
        0.7,
      ),
    ],
  },
  {
    id: "seasons-4",
    title: "Tilt away → winter",
    duration: 20,
    narration:
      "Six months later, Earth is on the other side of its orbit. The Northern Hemisphere now tilts away from the Sun. Sunlight arrives at a shallower angle and spreads across a larger area. Shorter days mean less heating, so temperatures generally fall. This is northern winter.",
    elements: [
      element("earth", "circle", 290, 280, 190, 190, "", "cyan"),
      element("axis", "line", 340, 405, -100, -250, "", "white"),
      element("sun", "circle", 760, 250, 95, 95, "", "amber"),
      element("ray-1", "arrow", 680, 215, -290, -50, "", "amber", 0.1),
      element("ray-2", "arrow", 680, 260, -290, 0, "", "amber", 0.18),
      text("winter", 290, 95, "NORTHERN WINTER", "violet", 0),
      text("energy", 550, 340, "Energy spreads out", "muted", 0.45),
      text(
        "days",
        480,
        460,
        "Shorter days  +  less direct sunlight",
        "white",
        0.75,
      ),
    ],
  },
  {
    id: "seasons-5",
    title: "One planet, opposite seasons",
    duration: 19,
    narration:
      "The two hemispheres have opposite seasons. When it is summer in the north, it is winter in the south. Around the March and September equinoxes, neither hemisphere tilts strongly toward the Sun. Day and night are roughly equal in length across much of Earth.",
    elements: [
      element("north-box", "rect", 110, 140, 315, 200, "", "violet"),
      element("south-box", "rect", 535, 140, 315, 200, "", "cyan"),
      text("north", 267, 195, "NORTHERN HEMISPHERE", "muted"),
      text("south", 692, 195, "SOUTHERN HEMISPHERE", "muted"),
      text("north-summer", 267, 265, "Summer", "amber", 0.05),
      text("south-winter", 692, 265, "Winter", "cyan", 0.16),
      element("opposite", "arrow", 442, 245, 76, 0, "", "muted", 0.25),
      text("equinox", 480, 430, "EQUINOX", "violet", 0.5),
      text("equal", 480, 472, "Day  ≈  Night", "white", 0.72),
    ],
  },
  {
    id: "seasons-6",
    title: "The idea to take with you",
    duration: 19,
    narration:
      "Remember the chain: Earth's tilt changes the angle of sunlight and the length of the day. Those changes create the seasons as Earth orbits the Sun. Distance is not the main cause. Now try explaining why Australia celebrates Christmas during summer. You already have the answer.",
    elements: [
      element("box1", "rect", 60, 185, 225, 115, "", "violet"),
      text("tilt", 172, 250, "Earth's tilt", "violet"),
      element("arr1", "arrow", 300, 242, 55, 0, "", "muted", 0.13),
      element("box2", "rect", 370, 185, 225, 115, "", "cyan", 0.2),
      text("light", 482, 230, "Sunlight angle", "cyan", 0.2),
      text("length", 482, 270, "+ day length", "cyan", 0.27),
      element("arr2", "arrow", 610, 242, 55, 0, "", "muted", 0.39),
      element("box3", "rect", 680, 185, 225, 115, "", "amber", 0.46),
      text("season", 792, 250, "Seasons", "amber", 0.46),
      text(
        "question",
        480,
        416,
        "Christmas in Australia = summer. Why?",
        "white",
        0.75,
      ),
      text(
        "hint",
        480,
        465,
        "Ask your tutor, or explain it in your own words.",
        "muted",
        0.9,
      ),
    ],
  },
].map((scene, index) => ({
  ...scene,
  sampleAudioUrl: `/sample/scene-${index + 1}.wav`,
}));

export function createSampleLesson() {
  return {
    id: crypto.randomUUID(),
    topic: sampleTopic,
    title: "Why do we have seasons?",
    summary:
      "A small tilt explains a whole year. Discover the connection between Earth's axis, sunlight, and the seasons.",
    level: "Beginner",
    source: "sample",
    createdAt: new Date().toISOString(),
    saved: false,
    scenes: structuredClone(sampleScenes),
    messages: [],
  };
}
