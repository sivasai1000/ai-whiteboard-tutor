import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { parse, create } = vi.hoisted(() => ({
  parse: vi.fn(),
  create: vi.fn(),
}));
vi.mock("../src/server/openai.js", () => ({
  createOpenAI: () => ({ responses: { parse, create } }),
}));

import { generateLesson } from "../src/server/lesson-service.js";
import { answerQuestion } from "../src/server/chat-service.js";
import { verifyNarration } from "../src/server/speech-tokens.js";

const narration =
  "Earth travels around the Sun once each year. Its axis is tilted, so sunlight reaches each hemisphere differently as Earth moves. This changes the length of the day and the angle of sunlight, creating the seasons we experience.";
const element = {
  id: "shape",
  type: "circle",
  x: 400,
  y: 260,
  width: 160,
  height: 160,
  text: "Earth",
  color: "cyan",
  appearAt: 0,
  points: "",
};
const scene = {
  id: "original",
  title: "A tilted world",
  narration,
  duration: 20,
  elements: [
    element,
    { ...element, id: "label", type: "text", width: 0, height: 0 },
    { ...element, id: "arrow", type: "arrow", width: 150, height: 0 },
  ],
};
function lesson() {
  return {
    title: "Why seasons change",
    summary: "Earth's tilted axis changes sunlight throughout the year.",
    scenes: Array.from({ length: 6 }, () => structuredClone(scene)),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NARRATION_SIGNING_SECRET", "test-only-secret");
});
afterEach(() => vi.unstubAllEnvs());

describe("lesson generation service", () => {
  it("serializes the strict schema, validates output, normalizes IDs and signs narration", async () => {
    parse.mockResolvedValue({ status: "completed", output_parsed: lesson() });
    const result = await generateLesson({
      topic: "Seasons",
      level: "Beginner",
    });
    const options = parse.mock.calls[0][0];
    expect(options.text.format.type).toBe("json_schema");
    expect(options.text.format.strict).toBe(true);
    expect(options.text.format.schema.properties.scenes).toBeDefined();
    expect(options.store).toBe(false);
    expect(options.max_output_tokens).toBe(10000);
    expect(result.source).toBe("ai");
    expect(result.scenes[0].id).toBe("scene-1");
    expect(result.scenes[1].elements[0].id).toBe("element-2-1");
    expect(
      verifyNarration(result.scenes[0].narration, result.scenes[0].speechToken),
    ).toBeTruthy();
    expect(result.messages).toEqual([]);
  });
  it("does not silently accept an incomplete provider response", async () => {
    parse.mockResolvedValue({ status: "incomplete", output_parsed: null });
    await expect(
      generateLesson({ topic: "Seasons", level: "Beginner" }),
    ).rejects.toMatchObject({ code: "LESSON_INCOMPLETE", status: 502 });
    expect(parse).toHaveBeenCalledTimes(1);
  });
  it("reports provider refusals as unsupported topics", async () => {
    parse.mockResolvedValue({
      status: "completed",
      output_parsed: null,
      output: [{ content: [{ type: "refusal" }] }],
    });
    await expect(
      generateLesson({ topic: "Unsafe request", level: "Beginner" }),
    ).rejects.toMatchObject({ code: "TOPIC_UNSUPPORTED", status: 422 });
  });
  it("rejects well-formed but visually unusable generated diagrams", async () => {
    const invalid = lesson();
    invalid.scenes[0].elements[0] = { ...element, x: 900, width: 600 };
    parse.mockResolvedValue({ status: "completed", output_parsed: invalid });
    await expect(
      generateLesson({ topic: "Seasons", level: "Beginner" }),
    ).rejects.toMatchObject({ code: "LESSON_QUALITY" });
  });
});

describe("follow-up service", () => {
  const input = {
    lesson: {
      title: "Seasons",
      summary: "Earth is tilted.",
      scenes: [{ title: "Tilt", narration }],
    },
    messages: [
      { role: "user", content: "What about the southern hemisphere?" },
    ],
  };
  it("sends actual lesson context and a bounded response budget", async () => {
    create.mockResolvedValue({
      status: "completed",
      output_text: "The seasons are opposite in the two hemispheres.",
    });
    expect(await answerQuestion(input)).toContain("opposite");
    const options = create.mock.calls[0][0];
    expect(options.input[1].content).toContain(narration);
    expect(options.input.at(-1)).toEqual(input.messages[0]);
    expect(options.max_output_tokens).toBe(700);
  });
  it("rejects incomplete answers instead of presenting truncated content as final", async () => {
    create.mockResolvedValue({
      status: "incomplete",
      output_text: "Half an answer",
    });
    await expect(answerQuestion(input)).rejects.toMatchObject({
      code: "ANSWER_INCOMPLETE",
    });
  });
});
