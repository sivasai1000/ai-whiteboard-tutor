import { describe, expect, it } from "vitest";
import {
  buildTimeline,
  resolvePlayback,
  visibleElements,
} from "../src/features/lesson/timeline.js";
import { sampleScenes } from "../src/lib/sample-lesson.js";

// These tests check playback invariants, independent of the player implementation.
describe("review: reversible lesson playback", () => {
  const durations = Object.fromEntries(
    sampleScenes.map((scene, index) => [scene.id, 11.5 + index * 2.75]),
  );
  const timeline = buildTimeline(sampleScenes, durations);

  it("maps exact chapter boundaries to the next chapter and the lesson end to the final board", () => {
    for (let index = 0; index < timeline.length; index++) {
      const state = resolvePlayback(timeline, timeline[index].start);
      expect(state.index).toBe(index);
      expect(state.localTime).toBe(0);
    }
    const end = resolvePlayback(timeline, timeline.at(-1).end);
    expect(end.index).toBe(sampleScenes.length - 1);
    expect(end.progress).toBe(1);
    expect(visibleElements(end.scene, end.progress)).toHaveLength(
      end.scene.elements.length,
    );
  });

  it("reconstructs the same board after forward, backward and repeated seeks", () => {
    const targets = [0, 7.25, 20.1, 44.3, 90, timeline.at(-1).end];
    const snapshot = (time) => {
      const state = resolvePlayback(timeline, time);
      return {
        scene: state.scene.id,
        elements: visibleElements(state.scene, state.progress).map(
          (element) => element.id,
        ),
      };
    };
    const expected = targets.map(snapshot);
    for (const sequence of [
      targets,
      [...targets].reverse(),
      [90, 0, 20.1, 7.25, 44.3],
    ])
      sequence.forEach(snapshot);
    expect(targets.map(snapshot)).toEqual(expected);
  });

  it("uses measured media durations instead of narration word-count estimates", () => {
    expect(timeline.at(-1).end).toBe(
      Object.values(durations).reduce((total, duration) => total + duration, 0),
    );
    expect(timeline[1].start).toBe(durations[sampleScenes[0].id]);
    expect(
      resolvePlayback(timeline, durations[sampleScenes[0].id] - 0.01).index,
    ).toBe(0);
  });

  it("clamps positions outside the lesson safely", () => {
    expect(resolvePlayback(timeline, -100).time).toBe(0);
    expect(resolvePlayback(timeline, 10000).time).toBe(timeline.at(-1).end);
    expect(resolvePlayback(timeline, Number.NaN).time).toBe(0);
    expect(resolvePlayback([], 0)).toBeNull();
  });
});
