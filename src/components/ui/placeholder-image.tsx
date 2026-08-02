// No real campaign/product photography exists yet, and free placeholder
// photo services can't be steered toward fashion-appropriate content (see
// DECISIONS.md - picsum handed back a waterfall, a coffee cup, a jellyfish
// for a fashion hero). Rather than gamble on another random photo, every
// image slot in the new layout renders one of these branded blocks until
// real photos are uploaded through the admin panel.
import type { Locale } from "@/lib/types";

const TONES = ["bg-cream-deep", "bg-rose/30", "bg-gold-soft/35", "bg-ink/8"];

const DEFAULT_LABEL: Record<Locale, string> = {
  he: "תמונה תוחלף",
  fr: "Image à venir",
  en: "Image coming soon",
};

export function PlaceholderImage({
  label,
  locale = "he",
  tone = 0,
  className = "",
}: {
  label?: string;
  locale?: Locale;
  tone?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${TONES[tone % TONES.length]} ${className}`}>
      {/* Positioned in a corner, not centered - callers often overlay their
          own centered content (hero headline, category name) on top, and a
          centered label would collide with it. */}
      <div className="absolute start-3 top-3 flex items-center gap-1.5 opacity-40">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m4 17 5-5 3.5 3.5L17 11l3 3" />
        </svg>
        <span className="text-[11px] tracking-wide text-ink">{label ?? DEFAULT_LABEL[locale]}</span>
      </div>
    </div>
  );
}
