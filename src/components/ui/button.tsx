export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const base =
    "min-h-11 rounded px-5 py-2.5 text-sm font-medium tracking-wide transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-ink text-cream hover:bg-gold",
    secondary: "border border-ink/20 bg-white hover:border-gold hover:text-gold",
  };
  return <button {...props} className={`${base} ${variants[variant]} ${className}`} />;
}
