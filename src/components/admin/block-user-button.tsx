"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BlockUserButton({ userId, isBlocked }: { userId: string; isBlocked: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick} disabled={saving}>
      {isBlocked ? "ביטול חסימה" : "חסימת משתמש"}
    </Button>
  );
}
