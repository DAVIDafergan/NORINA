// Three wordmark options for NORINA, for side-by-side comparison. Pure SVG
// (no rasterized assets), each scales cleanly from favicon to hero size.
// Text uses the site's own heading font (Playfair Display, loaded via
// --font-heading-latin) with a generic serif fallback so these still look
// reasonable if ever rendered outside the app's font context.
const WORDMARK_FONT = "var(--font-heading-latin, Playfair Display), Georgia, serif";

interface LogoProps {
  className?: string;
  /** Text/ink color. Defaults to currentColor so it inherits from CSS. */
  color?: string;
  /** Accent color for rules/monogram stroke. Defaults to the brand gold. */
  accent?: string;
}

/**
 * Variant 1 - "Classic Rule": a fashion-house lockup, thin gold rules above
 * and below a wide-tracked wordmark. The most traditional/safe option.
 */
export function LogoClassicRule({ className, color = "currentColor", accent = "#b08d57" }: LogoProps) {
  return (
    <svg viewBox="0 0 340 90" className={className} role="img" aria-label="NORINA">
      <line x1="20" y1="24" x2="320" y2="24" stroke={accent} strokeWidth="1" />
      <text
        x="170"
        y="58"
        textAnchor="middle"
        fill={color}
        fontFamily={WORDMARK_FONT}
        fontSize="34"
        fontWeight="600"
        letterSpacing="10"
      >
        NORINA
      </text>
      <line x1="20" y1="68" x2="320" y2="68" stroke={accent} strokeWidth="1" />
    </svg>
  );
}

/**
 * Variant 2 - "Monogram Lockup": a ringed "N" monogram beside a tighter
 * wordmark. The monogram alone (see LogoMonogramOnly) doubles as a
 * favicon/app-icon mark.
 */
export function LogoMonogramLockup({ className, color = "currentColor", accent = "#b08d57" }: LogoProps) {
  return (
    <svg viewBox="0 0 360 90" className={className} role="img" aria-label="NORINA">
      <circle cx="45" cy="45" r="32" fill="none" stroke={accent} strokeWidth="1.25" />
      <text
        x="45"
        y="57"
        textAnchor="middle"
        fill={color}
        fontFamily={WORDMARK_FONT}
        fontSize="34"
        fontWeight="600"
      >
        N
      </text>
      <text
        x="95"
        y="55"
        fill={color}
        fontFamily={WORDMARK_FONT}
        fontSize="28"
        fontWeight="500"
        letterSpacing="5"
      >
        ORINA
      </text>
    </svg>
  );
}

/** Standalone monogram mark (the "N" ring from Variant 2), for favicons/app icons. */
export function LogoMonogramOnly({ className, color = "currentColor", accent = "#b08d57" }: LogoProps) {
  return (
    <svg viewBox="0 0 90 90" className={className} role="img" aria-label="NORINA">
      <circle cx="45" cy="45" r="32" fill="none" stroke={accent} strokeWidth="1.25" />
      <text
        x="45"
        y="57"
        textAnchor="middle"
        fill={color}
        fontFamily={WORDMARK_FONT}
        fontSize="34"
        fontWeight="600"
      >
        N
      </text>
    </svg>
  );
}

/**
 * Variant 3 - "Editorial Swash": a drop-cap first letter and a small
 * diamond accent beneath, more magazine-editorial than the other two.
 */
export function LogoEditorialSwash({ className, color = "currentColor", accent = "#b08d57" }: LogoProps) {
  return (
    <svg viewBox="0 0 320 100" className={className} role="img" aria-label="NORINA">
      <text x="30" y="60" fill={color} fontFamily={WORDMARK_FONT} fontSize="46" fontWeight="600">
        N
      </text>
      <text
        x="70"
        y="58"
        fill={color}
        fontFamily={WORDMARK_FONT}
        fontSize="30"
        fontWeight="500"
        letterSpacing="6"
        fontStyle="italic"
      >
        ORINA
      </text>
      <rect x="150" y="78" width="8" height="8" fill={accent} transform="rotate(45 154 82)" />
    </svg>
  );
}

export const LOGO_VARIANTS = [
  { id: "classic-rule", label: "Classic Rule", Component: LogoClassicRule },
  { id: "monogram-lockup", label: "Monogram Lockup", Component: LogoMonogramLockup },
  { id: "editorial-swash", label: "Editorial Swash", Component: LogoEditorialSwash },
] as const;
