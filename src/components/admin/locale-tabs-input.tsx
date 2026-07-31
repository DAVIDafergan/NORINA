"use client";

import { useState } from "react";
import type { Locale, LocalizedText } from "@/lib/types";

const LOCALE_TABS: { code: Locale; label: string }[] = [
  { code: "he", label: "עברית" },
  { code: "fr", label: "צרפתית" },
  { code: "en", label: "אנגלית" },
];

export function LocaleTabsInput({
  value,
  onChange,
  label,
  multiline = false,
}: {
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  label: string;
  multiline?: boolean;
}) {
  const [tab, setTab] = useState<Locale>("he");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1">
        {LOCALE_TABS.map((localeTab) => (
          <button
            key={localeTab.code}
            type="button"
            onClick={() => setTab(localeTab.code)}
            className={`rounded px-2 py-1 text-xs ${
              tab === localeTab.code ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {localeTab.label}
          </button>
        ))}
      </div>
      {multiline ? (
        <textarea
          value={value[tab] ?? ""}
          onChange={(e) => onChange({ ...value, [tab]: e.target.value })}
          rows={3}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value[tab] ?? ""}
          onChange={(e) => onChange({ ...value, [tab]: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
