export function TextField({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink/70">{label}</span>
      <input
        {...props}
        className={`rounded-sm border border-ink/20 bg-transparent px-3.5 py-2.5 transition-colors focus:border-gold focus:outline-none ${className}`}
      />
    </label>
  );
}
