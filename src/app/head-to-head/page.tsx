export default function HeadToHeadPage() {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-border bg-surface-1 px-6 py-10">
      <h2 className="text-sm font-medium text-text-primary">
        Head-to-head records
      </h2>
      <p className="max-w-md text-sm text-text-muted">
        Coming soon — this needs a fuller pull of matchup-level history than
        we have confirmed yet. Check back once that data is in.
      </p>
    </div>
  );
}
