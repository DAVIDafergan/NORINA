import NextLink from "next/link";

const links = [
  { href: "/admin", label: "דשבורד" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/shipping", label: "משלוחים ואיסוף" },
];

export function AdminSidebar() {
  return (
    <nav className="w-56 shrink-0 border-e border-zinc-200 p-4">
      <p className="mb-6 px-2 text-lg font-semibold">NORINA — ניהול</p>
      <ul className="flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <NextLink
              href={link.href}
              className="block rounded px-3 py-2 text-sm hover:bg-zinc-100"
            >
              {link.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
