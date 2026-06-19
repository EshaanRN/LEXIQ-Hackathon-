// Tracks how many milliseconds the user has actively interacted with the app.
// "Active" = tab is visible, the window has focus, and the user has produced
// at least one interaction (mousemove, key, touch, scroll) within IDLE_MS.

import { useEffect, useState } from "react";

const IDLE_MS = 60_000;          // user counts as idle after 60s without input
const TICK_MS = 1_000;
const LS_KEY = "lexiq:active-ms";

type Listener = (ms: number) => void;

class ActiveTimer {
  private active = 0;
  private lastInput = 0;
  private listeners = new Set<Listener>();
  private started = false;
  private interval: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) this.active = Number(raw) || 0;
    } catch {}
    this.lastInput = Date.now();

    const bump = () => (this.lastInput = Date.now());
    const evts: (keyof WindowEventMap)[] = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    evts.forEach((e) => window.addEventListener(e, bump, { passive: true }));

    this.interval = setInterval(() => {
      const now = Date.now();
      const visible = typeof document === "undefined" || document.visibilityState === "visible";
      const focused = typeof document === "undefined" || document.hasFocus();
      const interactedRecently = now - this.lastInput < IDLE_MS;
      if (visible && focused && interactedRecently) {
        this.active += TICK_MS;
        try {
          localStorage.setItem(LS_KEY, String(this.active));
        } catch {}
        this.listeners.forEach((l) => l(this.active));
      }
    }, TICK_MS);
  }

  getMs() {
    return this.active;
  }

  /** Reset the counter (called after showing an ad). */
  reset() {
    this.active = 0;
    try {
      localStorage.setItem(LS_KEY, "0");
    } catch {}
    this.listeners.forEach((l) => l(0));
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
}

export const activeTimer = new ActiveTimer();

/** React hook returning the current active-ms count, re-rendering each tick. */
export function useActiveMs(): number {
  const [ms, setMs] = useState(() => activeTimer.getMs());
  useEffect(() => {
    activeTimer.start();
    const unsub = activeTimer.subscribe(setMs);
    return () => {
      unsub();
    };
  }, []);
  return ms;
}
