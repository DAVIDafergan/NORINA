export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "min-h-11 rounded-sm px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-ink text-cream hover:bg-gold",
    secondary: "border border-ink/20 bg-transparent text-ink hover:border-gold hover:text-gold",
    ghost: "text-ink/70 hover:text-gold",
  };
  return <button {...props} className={`${base} ${variants[variant]} ${className}`} />;
}
