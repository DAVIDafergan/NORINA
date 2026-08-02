"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`בטוחה שאת רוצה למחוק את "${productName}"? הפעולה הזו לא הפיכה.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? "מחיקה נכשלה");
      return;
    }
    router.push("/admin/products");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-red-600 transition-colors hover:underline disabled:opacity-50"
    >
      {loading ? "מוחקת..." : "מחיקת מוצר"}
    </button>
  );
}
