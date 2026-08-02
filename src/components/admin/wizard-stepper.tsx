const STEPS = ["פרטי מוצר", "צבעים ותמונות", "מידות ומלאי", "סיכום ופרסום"];

export function WizardStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        const done = step < current;
        return (
          <li key={label} className="flex items-center gap-2">
            {index > 0 && <span className="text-ink/25">—</span>}
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
                active
                  ? "bg-ink text-cream font-medium"
                  : done
                    ? "text-gold"
                    : "text-ink/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  active ? "bg-cream text-ink" : done ? "border border-gold" : "border border-ink/25"
                }`}
              >
                {done ? "✓" : step}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
