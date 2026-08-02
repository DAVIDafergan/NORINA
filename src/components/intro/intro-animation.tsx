"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const INTRO_KEY = "norina-intro-seen";
const LETTERS = "NORINA".split("");
const REVEAL_STAGGER_MS = 70;
const REVEAL_DURATION_MS = 550;
const HOLD_MS = 450;
const EXIT_DURATION_MS = 600;
const LINE_DELAY_MS = LETTERS.length * REVEAL_STAGGER_MS + 100;

function getSnapshot() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return sessionStorage.getItem(INTRO_KEY) !== "1";
}
function getServerSnapshot() {
  return false;
}
function subscribe() {
  // No real external event to subscribe to - useSyncExternalStore still uses
  // this (paired with getServerSnapshot) to reconcile the server-rendered
  // "hidden" state with the real client-only sessionStorage read right after
  // hydration, the same pattern as useCartHasHydrated in lib/cart-store.ts.
  return () => {};
}

/**
 * One-time, per-session intro: the wordmark reveals letter by letter, holds
 * briefly, then fades to reveal the site underneath. Gated by sessionStorage
 * so returning visitors (within the same tab session) never see it again,
 * and skipped entirely under prefers-reduced-motion.
 */
export function IntroAnimation() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [phase, setPhase] = useState<"reveal" | "exit" | "done">("reveal");
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!shouldShow) return;
    document.body.style.overflow = "hidden";

    function dismiss() {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      sessionStorage.setItem(INTRO_KEY, "1");
      setPhase("exit");
      window.setTimeout(() => setPhase("done"), EXIT_DURATION_MS);
    }

    const revealEnd = LETTERS.length * REVEAL_STAGGER_MS + REVEAL_DURATION_MS;
    const timer = window.setTimeout(dismiss, revealEnd + HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [shouldShow]);

  useEffect(() => {
    if (phase === "done") document.body.style.overflow = "";
  }, [phase]);

  function handleSkip() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    sessionStorage.setItem(INTRO_KEY, "1");
    setPhase("exit");
    window.setTimeout(() => setPhase("done"), EXIT_DURATION_MS);
  }

  if (!shouldShow || phase === "done") return null;

  return (
    <div
      role="presentation"
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-cream transition-opacity ease-out ${
        phase === "exit" ? "pointer-events-none opacity-0 duration-[600ms]" : "opacity-100 duration-300"
      }`}
    >
      <svg viewBox="0 0 340 90" className="w-56 sm:w-72" role="img" aria-label="NORINA">
        <line
          x1="20"
          y1="24"
          x2="320"
          y2="24"
          stroke="var(--color-gold)"
          strokeWidth="1"
          style={{
            transformOrigin: "170px 24px",
            animation: `intro-line 0.5s ease-out ${LINE_DELAY_MS}ms both`,
          }}
        />
        <text
          x="170"
          y="58"
          textAnchor="middle"
          className="fill-ink"
          fontFamily="var(--font-heading-latin)"
          fontSize="34"
          fontWeight="600"
          letterSpacing="10"
        >
          {LETTERS.map((letter, index) => (
            <tspan
              key={index}
              style={{ animation: `intro-letter 0.55s ease-out ${index * REVEAL_STAGGER_MS}ms both` }}
            >
              {letter}
            </tspan>
          ))}
        </text>
        <line
          x1="20"
          y1="68"
          x2="320"
          y2="68"
          stroke="var(--color-gold)"
          strokeWidth="1"
          style={{
            transformOrigin: "170px 68px",
            animation: `intro-line 0.5s ease-out ${LINE_DELAY_MS}ms both`,
          }}
        />
      </svg>
    </div>
  );
}
