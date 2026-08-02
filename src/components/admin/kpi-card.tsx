export function KpiCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-md border border-line bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        accent ? "border-t-2 border-t-gold" : ""
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-ink-soft">{label}</p>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
    </div>
  );
}
