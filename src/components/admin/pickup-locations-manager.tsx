"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleTabsInput } from "@/components/admin/locale-tabs-input";
import { Button } from "@/components/ui/button";
import type { LocalizedText } from "@/lib/types";

interface PickupLocationData {
  id: string;
  cityName: LocalizedText;
  address: string;
  isActive: boolean;
}

export function PickupLocationsManager({ locations }: { locations: PickupLocationData[] }) {
  const router = useRouter();
  const onChanged = () => router.refresh();

  return (
    <div className="flex flex-col gap-4">
      {locations.map((location) => (
        <LocationRow key={location.id} location={location} onChanged={onChanged} />
      ))}
      <NewLocationForm onCreated={onChanged} />
    </div>
  );
}

function LocationRow({ location, onChanged }: { location: PickupLocationData; onChanged: () => void }) {
  async function toggleActive() {
    await fetch(`/api/admin/pickup-locations/${location.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !location.isActive }),
    });
    onChanged();
  }

  async function handleDelete() {
    if (!confirm("להסיר את נקודת האיסוף?")) return;
    const res = await fetch(`/api/admin/pickup-locations/${location.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? "מחיקה נכשלה");
      return;
    }
    onChanged();
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-white shadow-sm p-3 text-sm">
      <div>
        <p className="font-medium">{location.cityName.he}</p>
        <p className="text-ink-soft">{location.address}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={location.isActive ? "text-green-700" : "text-ink/45"}>
          {location.isActive ? "פעילה" : "כבויה"}
        </span>
        <button type="button" onClick={toggleActive} className="text-ink/70 underline transition-colors hover:text-gold">
          {location.isActive ? "כיבוי" : "הפעלה"}
        </button>
        <button type="button" onClick={handleDelete} className="text-red-600 underline hover:text-red-800">
          הסרה
        </button>
      </div>
    </div>
  );
}

function NewLocationForm({ onCreated }: { onCreated: () => void }) {
  const [cityName, setCityName] = useState<LocalizedText>({ he: "", fr: "", en: "" });
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await fetch("/api/admin/pickup-locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityName, address, isActive: true }),
    });
    setSaving(false);
    setCityName({ he: "", fr: "", en: "" });
    setAddress("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border-dashed border-ink/25 bg-cream-deep/30 p-4">
      <h3 className="text-sm font-medium">הוספת נקודת איסוף</h3>
      <LocaleTabsInput label="עיר" value={cityName} onChange={setCityName} />
      <label className="flex flex-col gap-1 text-sm">
        <span>כתובת</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="rounded border border-ink/20 px-3 py-2"
        />
      </label>
      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "מוסיפה..." : "הוספה"}
      </Button>
    </form>
  );
}
