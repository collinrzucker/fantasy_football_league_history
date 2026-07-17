"use client";

import { useState } from "react";
import type { CareerRecord, Manager } from "@/types/league";

interface CareerWinPctChartProps {
  records: CareerRecord[];
  managerMap: Record<string, Manager>;
}

const TICKS = [0, 25, 50, 75, 100];

export function CareerWinPctChart({
  records,
  managerMap,
}: CareerWinPctChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const sorted = [...records].sort((a, b) => b.winPct - a.winPct);

  return (
    <div className="rounded-lg border border-border bg-surface-1 px-5 py-5">
      <h2 className="text-sm font-medium text-text-primary">
        Career win percentage
      </h2>
      <p className="text-sm text-text-muted">All completed seasons, 2012–2025</p>

      <div className="relative mt-6">
        {/* gridlines */}
        <div className="pointer-events-none absolute inset-0 top-0 bottom-5 left-16">
          {TICKS.map((tick) => (
            <div
              key={tick}
              className="absolute top-0 bottom-0 w-px bg-gridline"
              style={{ left: `${tick}%` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {sorted.map((record) => {
            const manager = managerMap[record.managerId];
            const pct = record.winPct * 100;
            const isHovered = hoveredId === record.managerId;
            return (
              <div
                key={record.managerId}
                className="relative flex items-center gap-3"
                onMouseEnter={() => setHoveredId(record.managerId)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(record.managerId)}
                onBlur={() => setHoveredId(null)}
                tabIndex={0}
              >
                <div className="w-16 shrink-0 text-sm text-text-secondary">
                  {manager?.fullName.split(" ")[0] ?? record.managerId}
                </div>
                <div className="relative h-5 flex-1">
                  <div
                    className="absolute inset-y-0 left-0 h-5 rounded-r bg-baseline/30"
                    style={{ width: "100%" }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 h-5 rounded-r transition-[filter]"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: "var(--seq-450)",
                      filter: isHovered ? "brightness(1.12)" : undefined,
                    }}
                  />
                </div>
                <div className="w-14 shrink-0 text-right text-sm tabular-nums text-text-primary">
                  {pct.toFixed(1)}%
                </div>

                {isHovered && (
                  <div
                    className="absolute left-16 top-full z-10 mt-1 rounded-md border border-border bg-surface-1 px-3 py-2 text-sm shadow-md"
                    role="tooltip"
                  >
                    <div className="font-medium text-text-primary">
                      {manager?.fullName ?? record.managerId}
                    </div>
                    <div className="text-text-secondary">
                      {record.wins}–{record.losses} ({pct.toFixed(1)}%)
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative mt-2 h-5 pl-16">
          {TICKS.map((tick) => (
            <div
              key={tick}
              className="absolute -translate-x-1/2 text-xs text-text-muted"
              style={{ left: `${tick}%` }}
            >
              {tick}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
