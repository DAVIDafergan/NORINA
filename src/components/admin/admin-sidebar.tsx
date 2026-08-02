"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "דשבורד" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/shipping", label: "משלוחים ואיסוף" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-60 shrink-0 border-e border-line bg-cream/60 p-5">
      <p className="mb-8 px-2 font-serif text-lg tracking-wide">NORINA — ניהול</p>
      <ul className="flex flex-col gap-1">
        {links.map((link) => {
          const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <NextLink
                href={link.href}
                className={`block rounded-sm border-s-2 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-gold bg-cream-deep font-medium text-ink"
                    : "border-transparent text-ink/70 hover:bg-cream-deep hover:text-ink"
                }`}
              >
                {link.label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
