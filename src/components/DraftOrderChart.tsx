import type { DraftYear, Manager, ManagerId } from "@/types/league";

interface DraftOrderChartProps {
  draftYears: DraftYear[];
  managerMap: Record<string, Manager>;
  managerOrder: ManagerId[];
  selectedManagerId: ManagerId | null;
  onSelectManager: (id: ManagerId) => void;
}

const CAT_COLORS = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
  "var(--cat-6)",
  "var(--cat-7)",
  "var(--cat-8)",
];

const WIDTH = 760;
const HEIGHT = 360;
const MARGIN = { top: 16, right: 88, bottom: 32, left: 40 };

export function DraftOrderChart({
  draftYears,
  managerMap,
  managerOrder,
  selectedManagerId,
  onSelectManager,
}: DraftOrderChartProps) {
  const years = draftYears.map((d) => d.year);
  const pickCount = Math.max(...draftYears.map((d) => d.order.length));
  const picks = Array.from({ length: pickCount }, (_, i) => i + 1);

  const plotW = WIDTH - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;

  const xFor = (year: number) =>
    years.length > 1
      ? MARGIN.left +
        ((year - years[0]) / (years[years.length - 1] - years[0])) * plotW
      : MARGIN.left + plotW / 2;

  // pick 1 (most favorable) at the top, pick N at the bottom.
  const yFor = (pick: number) =>
    MARGIN.top + ((pick - 1) / (pickCount - 1)) * plotH;

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Draft pick by year, per manager"
      >
        {/* gridlines + y-axis labels (recessive) */}
        {picks.map((pick) => (
          <g key={pick}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={yFor(pick)}
              y2={yFor(pick)}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 8}
              y={yFor(pick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-text-muted text-[10px]"
            >
              {pick}
            </text>
          </g>
        ))}

        {/* x-axis year labels */}
        {years.map((year) => (
          <text
            key={year}
            x={xFor(year)}
            y={HEIGHT - MARGIN.bottom + 16}
            textAnchor="middle"
            className="fill-text-muted text-[10px]"
          >
            {year}
          </text>
        ))}

        {/* one line per manager */}
        {managerOrder.map((managerId, idx) => {
          const points = draftYears
            .map((dy) => {
              const entry = dy.order.find((o) => o.managerId === managerId);
              return entry ? { year: dy.year, pick: entry.pick } : null;
            })
            .filter((p): p is { year: number; pick: number } => p !== null);
          if (points.length === 0) return null;

          const isSelected = selectedManagerId === managerId;
          const isDimmed = selectedManagerId !== null && !isSelected;
          const color = CAT_COLORS[idx % CAT_COLORS.length];
          const dashed = idx >= CAT_COLORS.length;
          const path = points
            .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.year)},${yFor(p.pick)}`)
            .join(" ");
          const last = points[points.length - 1];
          const name =
            managerMap[managerId]?.fullName.split(" ")[0] ?? managerId;

          return (
            <g
              key={managerId}
              opacity={isDimmed ? 0.2 : 1}
              className="cursor-pointer"
              onClick={() => onSelectManager(managerId)}
            >
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={dashed ? "5 3" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p) => (
                <circle
                  key={p.year}
                  cx={xFor(p.year)}
                  cy={yFor(p.pick)}
                  r={isSelected ? 4.5 : 3.5}
                  fill={color}
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                >
                  <title>
                    {name} — {p.year}: pick {p.pick}
                  </title>
                </circle>
              ))}
              {isSelected && (
                <text
                  x={xFor(last.year) + 8}
                  y={yFor(last.pick)}
                  dominantBaseline="middle"
                  className="fill-text-primary text-xs font-medium"
                >
                  {name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
        {managerOrder.map((managerId, idx) => {
          const color = CAT_COLORS[idx % CAT_COLORS.length];
          const dashed = idx >= CAT_COLORS.length;
          const isSelected = selectedManagerId === managerId;
          return (
            <button
              key={managerId}
              type="button"
              onClick={() => onSelectManager(managerId)}
              className={`inline-flex items-center gap-1.5 text-xs ${
                isSelected ? "font-semibold text-text-primary" : "text-text-secondary"
              } hover:text-text-primary`}
            >
              <span
                aria-hidden="true"
                className="inline-block h-0.5 w-4"
                style={{
                  backgroundColor: dashed ? "transparent" : color,
                  backgroundImage: dashed
                    ? `repeating-linear-gradient(to right, ${color} 0 3px, transparent 3px 5px)`
                    : undefined,
                }}
              />
              {managerMap[managerId]?.fullName.split(" ")[0] ?? managerId}
            </button>
          );
        })}
      </div>
    </div>
  );
}
