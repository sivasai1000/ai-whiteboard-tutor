/** The board is a pure function of the audio clock, so seeking is reversible. */
export function buildTimeline(scenes, durations = {}, timings = {}) {
  let cursor = 0;
  return scenes.map((scene) => {
    const measured = durations[scene.id];
    const duration =
      Number.isFinite(measured) && measured > 0
        ? measured
        : Math.max(1, scene.duration || 20);
    const segment = {
      scene,
      start: cursor,
      end: cursor + duration,
      duration,
      cues: timings[scene.id] || scene.cues || [],
    };
    cursor = segment.end;
    return segment;
  });
}

export function resolvePlayback(timeline, time) {
  if (!timeline.length) return null;
  const total = timeline.at(-1).end;
  const clampedTime = Math.max(
    0,
    Math.min(Number.isFinite(time) ? time : 0, total),
  );
  const index = Math.max(
    0,
    timeline.findIndex(
      (segment, i) => clampedTime < segment.end || i === timeline.length - 1,
    ),
  );
  const segment = timeline[index];
  const localTime = Math.max(
    0,
    Math.min(clampedTime - segment.start, segment.duration),
  );
  const stepIndex = Math.max(
    0,
    segment.cues.findIndex(
      (cue, i) => localTime < cue.end || i === segment.cues.length - 1,
    ),
  );
  return {
    ...segment,
    stepIndex,
    cue: segment.cues[stepIndex],
    cueProgress: segment.cues[stepIndex]
      ? Math.max(
          0,
          Math.min(
            1,
            (localTime - segment.cues[stepIndex].start) /
              Math.max(
                0.001,
                segment.cues[stepIndex].end - segment.cues[stepIndex].start,
              ),
          ),
        )
      : 0,
    index,
    time: clampedTime,
    localTime,
    progress: localTime / segment.duration,
    total,
  };
}

export function visibleElements(scene, progress) {
  return scene.elements.filter(
    (element) => element.appearAt <= progress + 0.001,
  );
}
