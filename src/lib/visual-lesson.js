import { checkMoonScene, MOON_LAYOUT } from "./moon-scene.js";

/** Semantic diagrams keep layout deterministic; model output never contains markup. */
export function checkVisualLesson(lesson) {
  const issues = [];
  for (const scene of lesson.scenes) {
    const { nodes, links, layout } = scene.visual;
    const ids = new Set(nodes.map((node) => node.id));
    if (layout === MOON_LAYOUT) issues.push(...checkMoonScene(scene));
    if (ids.size !== nodes.length) issues.push("Diagram IDs must be unique.");
    if (["flow", "concept", "bars"].includes(layout) && nodes.length > 6)
      issues.push("This diagram supports up to six readable nodes.");
    if (layout === "cycle" && (nodes.length < 3 || nodes.length > 6))
      issues.push("Cycles need three to six nodes.");
    if (layout === "equation" && nodes.length > 5)
      issues.push("Equations support up to five readable steps.");
    if (scene.steps.map((step) => step.narration).join(" ").length > 800)
      issues.push("Chapter narration exceeds the speech limit.");
    if (
      layout === "array" &&
      [...nodes, ...scene.steps.flatMap((step) => step.updates)].some(
        (node) => node.label.length > 8,
      )
    )
      issues.push("Array labels must fit within eight characters.");
    if (layout === "comparison" && nodes.length !== 2)
      issues.push("Comparisons need two sides.");
    if (layout === "bars" && nodes.every((node) => node.value === 0))
      issues.push("A chart needs a positive value.");
    for (const link of links) {
      if (!ids.has(link.from) || !ids.has(link.to) || link.from === link.to)
        issues.push("Every connector needs two different diagram nodes.");
    }
    for (const step of scene.steps) {
      const visible = new Set(step.visible);
      if (!visible.size) issues.push("Every teaching step needs a visual.");
      for (const list of [step.visible, step.focus, step.dim]) {
        if (
          new Set(list).size !== list.length ||
          list.some((id) => !ids.has(id))
        )
          issues.push("Teaching steps must reference existing nodes once.");
      }
      if ([...step.focus, ...step.dim].some((id) => !visible.has(id)))
        issues.push("Only visible nodes can be emphasized or dimmed.");
      if (step.focus.some((id) => step.dim.includes(id)))
        issues.push("A node cannot be highlighted and discarded together.");
      if (step.updates.some((update) => !ids.has(update.id)))
        issues.push("Updates must reference existing nodes.");
      if (
        new Set(step.updates.map((update) => update.id)).size !==
        step.updates.length
      )
        issues.push("Update a node only once in each teaching step.");
    }
  }
  return [...new Set(issues)];
}

/** Reconstruct from the beginning instead of mutating React state: seeking is reversible. */
export function resolveVisualStep(scene, stepIndex = 0) {
  const index = Math.max(0, Math.min(stepIndex, scene.steps.length - 1));
  const step = scene.steps[index];
  const nodes = new Map(
    scene.visual.nodes.map((node) => [node.id, { ...node }]),
  );
  for (const previous of scene.steps.slice(0, index + 1)) {
    for (const update of previous.updates || []) {
      const node = nodes.get(update.id);
      if (node)
        Object.assign(node, { label: update.label, value: update.value });
    }
  }
  return {
    ...scene.visual,
    nodes: [...nodes.values()],
    visible: new Set(step.visible),
    focus: new Set(step.focus),
    dim: new Set(step.dim),
    note: step.note,
    index,
  };
}
