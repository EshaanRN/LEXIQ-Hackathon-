import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { activeTimer, useActiveMs } from "@/lib/active-timer";
import { usePremium } from "@/lib/premium";

const INTERVAL_MS = 5 * 60 * 1000; // 5 active minutes
const COUNTDOWN_S = 5;

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
// Paste your AdSense interstitial/in-article ad unit slot ID here once approved.
const INTERSTITIAL_SLOT = import.meta.env.VITE_ADSENSE_INTERSTITIAL_SLOT as string | undefined;

function InterstitialAdBody() {
  const useReal = Boolean(ADSENSE_CLIENT && INTERSTITIAL_SLOT);
  const pushed = useRef(false);
  useEffect(() => {
    if (!useReal || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("[adsense] interstitial push failed", err);
    }
  }, [useReal]);

  if (!useReal) {
    return (
      <div className="mt-5 flex h-44 items-center justify-center rounded-2xl border border-dashed border-border bg-surface-2/60 text-xs uppercase tracking-widest text-muted-foreground">
        Ad placeholder
      </div>
    );
  }

  return (
    <div className="mt-5 h-44 overflow-hidden rounded-2xl bg-surface-2/60">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={INTERSTITIAL_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}


/**
 * Full-screen "Sponsored" overlay that appears every 5 active minutes.
 * - Suppressed for Premium users.
 * - Suppressed during checkpoint/onboarding/auth so it never interrupts a test.
 * - Resets the active timer when dismissed.
 */
export function AdInterstitial() {
  const { isPremium, loading } = usePremium();
  const ms = useActiveMs();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_S);
  const shownAt = useRef<number>(0);

  // Suppress on routes where interruption would be harmful.
  const suppress =
    pathname.startsWith("/checkpoint") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/welcome");

  useEffect(() => {
    if (loading || isPremium || suppress || open) return;
    if (ms - shownAt.current >= INTERVAL_MS) {
      shownAt.current = ms;
      setOpen(true);
      setCountdown(COUNTDOWN_S);
    }
  }, [ms, isPremium, loading, suppress, open]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [open]);

  if (!open || isPremium) return null;

  const close = () => {
    setOpen(false);
    activeTimer.reset();
    shownAt.current = 0;
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-6 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center">
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/80">
          Sponsored
        </span>
        <button
          onClick={close}
          disabled={countdown > 0}
          aria-label="Close ad"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-surface-2 ring-1 ring-border transition hover:bg-surface disabled:opacity-50"
        >
          {countdown > 0 ? (
            <span className="text-xs font-bold">{countdown}</span>
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>

        <Sparkles className="mx-auto mt-4 h-8 w-8 text-primary" />
        <h2 className="mt-3 font-display text-xl font-bold text-gradient-primary">
          Quick break — sponsored message
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lexiq stays free thanks to ads. Your progress is saved — you'll pick up exactly
          where you left off.
        </p>

        <InterstitialAdBody />


        <Link
          to="/premium"
          onClick={close}
          className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground glow-primary"
        >
          Remove ads with Premium
        </Link>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/70">
          You can close this in {countdown}s
        </p>
      </div>
    </div>
  );
}
