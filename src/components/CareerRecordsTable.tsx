"use client";

import { useMemo, useState } from "react";
import type { CareerRecord, Manager } from "@/types/league";

interface CareerRecordsTableProps {
  records: CareerRecord[];
  managerMap: Record<string, Manager>;
}

type SortKey =
  | "manager"
  | "wins"
  | "losses"
  | "winPct"
  | "playoffApps"
  | "championshipApps"
  | "championships";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "manager", label: "Manager" },
  { key: "wins", label: "W", align: "right" },
  { key: "losses", label: "L", align: "right" },
  { key: "winPct", label: "Win%", align: "right" },
  { key: "playoffApps", label: "Playoffs", align: "right" },
  { key: "championshipApps", label: "Finals", align: "right" },
  { key: "championships", label: "Titles", align: "right" },
];

export function CareerRecordsTable({
  records,
  managerMap,
}: CareerRecordsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("wins");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const withNames = records.map((r) => ({
      ...r,
      managerName: managerMap[r.managerId]?.fullName ?? r.managerId,
    }));
    return withNames.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "manager") {
        cmp = a.managerName.localeCompare(b.managerName);
      } else {
        cmp = a[sortKey] - b[sortKey];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [records, managerMap, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[560px] border-collapse text-sm">
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
          {sorted.map((record, i) => (
            <tr
              key={record.managerId}
              className={i % 2 === 1 ? "bg-page/40" : undefined}
            >
              <td className="px-4 py-2.5 text-text-primary">
                {record.managerName}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">
                {record.wins}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                {record.losses}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">
                {(record.winPct * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                {record.playoffApps}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                {record.championshipApps}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">
                {record.championships}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
