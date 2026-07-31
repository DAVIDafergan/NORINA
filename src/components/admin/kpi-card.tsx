export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-200 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
