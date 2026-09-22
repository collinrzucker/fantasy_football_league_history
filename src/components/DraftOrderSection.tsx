"use client";

import { useMemo, useState } from "react";
import type { DraftYear, Manager, ManagerId } from "@/types/league";
import { DraftOrderGrid } from "@/components/DraftOrderGrid";
import { DraftOrderChart } from "@/components/DraftOrderChart";

interface DraftOrderSectionProps {
  draftYears: DraftYear[];
  managerMap: Record<string, Manager>;
}

const VIEW_OPTIONS = [
  { value: "table", label: "Table" },
  { value: "chart", label: "Chart" },
] as const;

export function DraftOrderSection({
  draftYears,
  managerMap,
}: DraftOrderSectionProps) {
  const [view, setView] = useState<"table" | "chart">("table");
  const [selectedManagerId, setSelectedManagerId] = useState<ManagerId | null>(
    null
  );

  // Fixed hue order: first-drafted managers get the 8 categorical slots;
  // anyone beyond that reuses a slot with a dashed line (secondary encoding).
  const managerOrder = useMemo(() => {
    const order: ManagerId[] = [];
    const seen = new Set<ManagerId>();
    for (const dy of draftYears) {
      for (const pick of [...dy.order].sort((a, b) => a.pick - b.pick)) {
        if (!seen.has(pick.managerId)) {
          seen.add(pick.managerId);
          order.push(pick.managerId);
        }
      }
    }
    return order;
  }, [draftYears]);

  function handleSelect(id: ManagerId) {
    setSelectedManagerId((current) => (current === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setView(opt.value)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              view === opt.value
                ? "border-seq-450 bg-seq-450 text-white"
                : "border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {view === "table" ? (
        <DraftOrderGrid
          draftYears={draftYears}
          managerMap={managerMap}
          selectedManagerId={selectedManagerId}
          onSelectManager={handleSelect}
        />
      ) : (
        <DraftOrderChart
          draftYears={draftYears}
          managerMap={managerMap}
          managerOrder={managerOrder}
          selectedManagerId={selectedManagerId}
          onSelectManager={handleSelect}
        />
      )}
    </div>
  );
}
