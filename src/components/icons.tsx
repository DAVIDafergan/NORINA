// Minimal line icons, hand-drawn to match the brand's understated aesthetic -
// not worth pulling in an icon library for five glyphs.
type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function BagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 8h11l.9 12.2a1.5 1.5 0 0 1-1.5 1.8H7.1a1.5 1.5 0 0 1-1.5-1.8L6.5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.6-4.6" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
  );
}

export function HangerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.5a1.6 1.6 0 1 1 1.9 1.58" />
      <path d="M12 6.5v2" />
      <path d="M12 8.5 3.5 15c-1 .75-.45 2.3.8 2.3h15.4c1.25 0 1.8-1.55.8-2.3L12 8.5Z" />
      <path d="M6 15.5h12" />
    </svg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M11.5 3.5H5a1.5 1.5 0 0 0-1.5 1.5v6.5c0 .4.16.78.44 1.06l9 9c.6.6 1.55.6 2.12 0l6.5-6.5c.6-.6.6-1.55 0-2.12l-9-9a1.5 1.5 0 0 0-1.06-.44Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="8.5" width="18" height="7" rx="1.2" transform="rotate(-8 12 12)" />
      <path d="M7 9.5 6.4 12M11 9 10.4 11.5M15 8.5 14.4 11" />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4.5" width="14" height="17" rx="1.6" />
      <path d="M9 4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5V6H9V4.5Z" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6.5h10.5v9H3z" />
      <path d="M13.5 10h3.7l3.3 3v2.5h-7V10Z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  );
}

export function LandscapeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="1.6" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 17 5.5-6 4 4.2L16 12l4 5" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 5.5v13l11-6.5-11-6.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="18" cy="6" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="m8 10.8 8-4.4M8 13.2l8 4.4" />
    </svg>
  );
}

export function CartAddIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h1.7l1.9 10.5a1.6 1.6 0 0 0 1.58 1.3h7.6a1.6 1.6 0 0 0 1.57-1.28L19 8H6.1" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="16" cy="19.5" r="1.3" />
      <path d="M15 6.5h4M17 4.5v4" />
    </svg>
  );
}
