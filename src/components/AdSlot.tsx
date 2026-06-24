import { useEffect, useRef } from "react";
import { usePremium } from "@/lib/premium";
import { Link, useRouterState } from "@tanstack/react-router";
import { AxiomAd } from "@/components/AxiomAd";

/**
 * Real AdSense ad slot (with placeholder fallback). Hides for Premium users.
 *
 * To go live:
 *   1. Set VITE_ADSENSE_CLIENT in .env.* to your `ca-pub-...` ID.
 *   2. In Google AdSense, create an ad unit and copy its slot ID (10-digit number).
 *   3. Pass it as the `slot` prop. Without `slot` (or without VITE_ADSENSE_CLIENT)
 *      the placeholder shows so the layout never breaks.
 */
interface Props {
  variant?: "sidebar" | "banner";
  className?: string;
  /** AdSense ad unit slot ID, e.g. "1234567890". */
  slot?: string;
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ variant = "banner", className = "", slot }: Props) {
  const { isPremium, loading } = usePremium();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const insRef = useRef<HTMLModElement | null>(null);

  const useReal = Boolean(ADSENSE_CLIENT && slot);

  useEffect(() => {
    if (!useReal || isPremium) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("[adsense] push failed", err);
    }
  }, [useReal, isPremium, pathname]);

  if (loading || isPremium) return null;

  const sizeCls =
    variant === "sidebar"
      ? "h-[260px] w-full max-w-[300px]"
      : "h-[72px] w-full";

  return (
    <aside
      aria-label="Sponsored content"
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface-2/60 ${sizeCls} ${className}`}
    >
      <span className="absolute left-2 top-1.5 z-10 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white/80">
        Ad
      </span>
      {useReal ? (
        <ins
          ref={insRef as never}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex h-full w-full flex-col">
          <div className="min-h-0 flex-1">
            <AxiomAd compact={variant === "banner"} />
          </div>
          <Link
            to="/premium"
            className="block w-full py-1 text-center text-[9px] font-semibold uppercase tracking-widest text-white/80 hover:text-white"
            style={{ background: "linear-gradient(135deg, hsl(260 28% 14%) 0%, hsl(270 38% 22%) 100%)" }}
          >
            Go Premium · Remove ads
          </Link>
        </div>
      )}
    </aside>
  );
}
