"use client";

import { useMemo, useState } from "react";
import type { DraftAverage, Manager } from "@/types/league";

interface AvgDraftPositionTableProps {
  averages: DraftAverage[];
  managerMap: Record<string, Manager>;
}

type SortKey = "manager" | "allTime" | "last3" | "last5";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "manager", label: "Manager" },
  { key: "allTime", label: "Avg pick (all-time)", align: "right" },
  { key: "last3", label: "Avg pick (last 3 yrs)", align: "right" },
  { key: "last5", label: "Avg pick (last 5 yrs)", align: "right" },
];

function fmt(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
}

export function AvgDraftPositionTable({
  averages,
  managerMap,
}: AvgDraftPositionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("allTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const withNames = averages.map((a) => ({
      ...a,
      managerName: managerMap[a.managerId]?.fullName ?? a.managerId,
    }));
    return withNames.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "manager") {
        cmp = a.managerName.localeCompare(b.managerName);
      } else {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === null && bv === null) cmp = 0;
        else if (av === null) cmp = 1;
        else if (bv === null) cmp = -1;
        else cmp = av - bv;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [averages, managerMap, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "manager" ? "asc" : "asc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={
                  sortKey === col.key
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className={`px-4 py-3 font-medium text-text-muted ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSort(col.key)}
                  className="inline-flex items-center gap-1 hover:text-text-primary"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span aria-hidden="true">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.managerId} className={i % 2 === 1 ? "bg-page/40" : undefined}>
              <td className="px-4 py-2.5 text-text-primary">{row.managerName}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">
                {fmt(row.allTime)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                {fmt(row.last3)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                {fmt(row.last5)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-xs text-text-muted">
        Lower average pick = earlier, more favorable draft slot, more often.
      </p>
    </div>
  );
}
