import NextLink from "next/link";

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">דשבורד</h1>
      <p className="text-zinc-500">הדשבורד המלא (KPIs, גרפים) יתווסף בשלב הבא.</p>
      <NextLink href="/admin/products" className="font-medium hover:underline">
        ניהול מוצרים
      </NextLink>
    </div>
  );
}
