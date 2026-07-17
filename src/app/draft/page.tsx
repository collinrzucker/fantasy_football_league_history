import { getDraftAverages, getDraftYears, getManagerMap } from "@/lib/data";
import { DraftOrderGrid } from "@/components/DraftOrderGrid";
import { AvgDraftPositionTable } from "@/components/AvgDraftPositionTable";

export default function DraftPage() {
  const managerMap = getManagerMap();
  const draftYears = getDraftYears();
  const averages = getDraftAverages();
  const managerMapObj = Object.fromEntries(managerMap);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium text-text-primary">
            Draft order by year
          </h2>
          <p className="text-sm text-text-muted">
            Pick order, {draftYears[0]?.year}–{draftYears[draftYears.length - 1]?.year}
          </p>
        </div>
        <DraftOrderGrid draftYears={draftYears} managerMap={managerMap} />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium text-text-primary">
            Average draft position
          </h2>
          <p className="text-sm text-text-muted">
            Who gets the luckiest (or unluckiest) draft slot, on average
          </p>
        </div>
        <AvgDraftPositionTable averages={averages} managerMap={managerMapObj} />
      </section>
    </div>
  );
}
