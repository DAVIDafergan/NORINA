export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-linear-to-b from-rose/20 via-cream to-cream px-4 py-16">
      <div className="w-full max-w-sm animate-fade-up rounded-sm border border-line bg-cream px-8 py-10 shadow-sm sm:px-10">
        {children}
      </div>
    </div>
  );
}
