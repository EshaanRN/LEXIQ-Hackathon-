import { usePremium } from "@/lib/premium";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

interface Props {
  /** Visual size of the slot. */
  variant?: "sidebar" | "banner";
  /** Optional caption beneath the ad placeholder. */
  className?: string;
}

/**
 * Non-intrusive ad placeholder. Hides for Premium users.
 * Drop a real ad network's <ins> tag inside the inner box once approved.
 */
export function AdSlot({ variant = "banner", className = "" }: Props) {
  const { isPremium, loading } = usePremium();
  if (loading || isPremium) return null;

  const sizeCls =
    variant === "sidebar"
      ? "min-h-[600px] w-full max-w-[300px]"
      : "min-h-[90px] w-full";

  return (
    <aside
      aria-label="Sponsored content"
      className={`relative overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2/60 ${sizeCls} ${className}`}
    >
      <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/80">
        Sponsored
      </span>
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
        <Sparkles className="h-5 w-5 opacity-50" />
        <p className="text-[11px] uppercase tracking-widest">Ad space</p>
        <Link
          to="/premium"
          className="mt-2 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary ring-1 ring-primary/30 hover:bg-primary/25"
        >
          Go Premium · Remove ads
        </Link>
      </div>
    </aside>
  );
}
