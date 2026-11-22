import { visualizationColors as colors } from "./style";

/** One ordered strip per row keeps an array visually connected at every size. */
export function ArrayDiagram({ state, positions, compact }) {
  const rows = [...new Set(positions.map((position) => position.y))];
  return (
    <g>
      {rows.map((y) => {
        const row = positions.filter((position) => position.y === y);
        const first = row[0],
          last = row.at(-1);
        return (
          <rect
            key={y}
            x={first.x - 8}
            y={y - 8}
            width={last.x + last.w - first.x + 16}
            height={first.h + 16}
            rx="14"
            fill="var(--diagram-surface)"
            stroke="var(--diagram-grid)"
          />
        );
      })}
      {state.nodes.map((node, index) => {
        if (!state.visible.has(node.id)) return null;
        const p = positions[index];
        const active = state.focus.has(node.id),
          dim = state.dim.has(node.id);
        const tone = colors[node.color];
        const size = Math.min(
          compact ? 25 : 29,
          (p.w - 16) / (node.label.length * 0.65),
        );
        return (
          <g
            key={node.id}
            data-node-id={node.id}
            data-focused={active}
            data-dimmed={dim}
          >
            <rect
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              rx="9"
              fill={active ? tone.ink : "var(--board)"}
              fillOpacity={active ? 1 : dim ? 0.25 : 0.7}
            />
            <text
              x={p.x + p.w / 2}
              y={p.y + p.h / 2}
              dominantBaseline="central"
              textAnchor="middle"
              fill={
                active
                  ? "var(--diagram-on-color)"
                  : dim
                    ? "var(--diagram-muted)"
                    : "var(--diagram-ink)"
              }
              fontSize={size}
              fontWeight={active ? 600 : 500}
            >
              {node.label}
            </text>
            <text
              x={p.x + p.w / 2}
              y={p.y + p.h + 33}
              textAnchor="middle"
              fill={active ? tone.ink : "var(--diagram-muted)"}
              fontSize="12"
              fontFamily="ui-monospace, monospace"
            >
              {index}
            </text>
            {active && (
              <line
                x1={p.x + p.w / 2 - 9}
                x2={p.x + p.w / 2 + 9}
                y1={p.y - 19}
                y2={p.y - 19}
                stroke={tone.ink}
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
            {dim && (
              <line
                x1={p.x + p.w * 0.28}
                x2={p.x + p.w * 0.72}
                y1={p.y + p.h * 0.64}
                y2={p.y + p.h * 0.36}
                stroke="var(--diagram-muted)"
                strokeWidth="1.5"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
