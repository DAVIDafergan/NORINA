"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DuplicateButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}/duplicate`, { method: "POST" });
    setLoading(false);
    if (!res.ok) return;
    const { id } = await res.json();
    router.push(`/admin/products/${id}`);
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={loading} type="button">
      {loading ? "משכפלת..." : "שכפול מוצר"}
    </Button>
  );
}
