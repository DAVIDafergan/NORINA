"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useToastStore } from "@/lib/toast-store";

const DISPLAY_MS = 2600;

export function ToastHost() {
  const { message, id } = useToastStore();
  const [hiddenId, setHiddenId] = useState(0);

  useEffect(() => {
    if (id === 0) return;
    const timer = setTimeout(() => setHiddenId(id), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [id]);

  const visible = id !== 0 && id !== hiddenId;
  if (!message || !visible) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex justify-center px-4 md:bottom-8">
      <div key={id} className="animate-fade-up rounded-sm bg-ink px-5 py-3 text-sm text-cream shadow-lg">
        {message}
      </div>
    </div>,
    document.body,
  );
}
