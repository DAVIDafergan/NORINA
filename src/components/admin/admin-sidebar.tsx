"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon } from "@/components/icons";

const links = [
  { href: "/admin", label: "דשבורד" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/sizes", label: "מידות" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/shipping", label: "משלוחים ואיסוף" },
];

function linkClasses(active: boolean) {
  return `block rounded-sm border-s-2 px-3 py-3 text-sm transition-colors ${
    active
      ? "border-gold bg-cream-deep font-medium text-ink"
      : "border-transparent text-ink/70 hover:bg-cream-deep hover:text-ink"
  }`;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar - the desktop sidebar below is hidden on narrow screens
          entirely (not just visually collapsed), since a fixed w-60 sidebar
          would eat most of a phone's width. */}
      <div className="flex items-center justify-between border-b border-line bg-cream px-4 py-3 md:hidden">
        <span className="font-serif text-lg tracking-wide">NORINA — ניהול</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="תפריט ניהול"
          aria-expanded={open}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
        >
          <span className="block h-px w-6 bg-ink" />
          <span className="block h-px w-6 bg-ink" />
          <span className="block h-px w-6 bg-ink" />
        </button>
      </div>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100]">
            <button
              type="button"
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40 animate-fade-up"
            />
            <div className="absolute inset-y-0 start-0 flex w-[80vw] max-w-xs flex-col gap-1 overflow-y-auto bg-cream p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-serif text-lg tracking-wide">NORINA — ניהול</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="סגירה"
                  className="flex h-9 w-9 items-center justify-center text-ink/70 hover:text-gold"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              {links.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={linkClasses(isActive(link.href))}
                >
                  {link.label}
                </NextLink>
              ))}
            </div>
          </div>,
          document.body,
        )}

      {/* Desktop sidebar */}
      <nav className="hidden w-60 shrink-0 border-e border-line bg-cream/60 p-5 md:block">
        <p className="mb-8 px-2 font-serif text-lg tracking-wide">NORINA — ניהול</p>
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <NextLink href={link.href} className={linkClasses(isActive(link.href))}>
                {link.label}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
