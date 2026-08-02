export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/12 p-5">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
