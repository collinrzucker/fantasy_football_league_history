interface StatTileProps {
  label: string;
  value: string;
  detail?: string;
}

export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 px-5 py-4">
      <div className="text-sm text-text-muted">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-text-primary">{value}</div>
      {detail && <div className="mt-1 text-sm text-text-secondary">{detail}</div>}
    </div>
  );
}
