export function TextField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        {...props}
        className="rounded border border-zinc-300 px-3 py-2 focus:border-zinc-900 focus:outline-none"
      />
    </label>
  );
}
