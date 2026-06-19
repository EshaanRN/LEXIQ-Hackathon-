import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Sparkles, ShieldCheck, Loader2, AlertTriangle, Coins, X } from "lucide-react";
import { useState } from "react";
import { usePremium } from "@/lib/premium";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/_authenticated/premium")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    checkout: s.checkout === "success" ? ("success" as const) : undefined,
  }),
  component: PremiumPage,
});

const FEATURES = [
  "Ad-free learning across all devices",
  "Unlimited daily goal and review queue",
  "Premium pronunciation voices",
  "Priority support",
  "Early access to new SAT & ACT word packs",
];

function PremiumPage() {
  const { isPremium, plan, until, status } = usePremium();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_authenticated/premium" });
  const { openCheckout, loading } = usePaddleCheckout();
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [busy, setBusy] = useState(false);
  const [showWelcome, setShowWelcome] = useState(search.checkout === "success");

  async function startCheckout() {
    setBusy(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        navigate({ to: "/auth" });
        return;
      }
      await openCheckout({
        priceId: selected === "annual" ? "lexiq_premium_annual" : "lexiq_premium_monthly",
        customerEmail: user.email ?? undefined,
        customData: { userId: user.id },
        successUrl: `${window.location.origin}/premium?checkout=success`,
      });
    } catch (e) {
      console.error(e);
      alert("Could not open checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PaymentTestModeBanner />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-6 pb-24">
        <div className="flex items-center gap-3">
          <Link to="/avatar" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-xl font-bold">Lexiq Premium</h1>
        </div>

        {status === "past_due" && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">Your last payment didn't go through.</p>
              <p className="mt-0.5 text-xs text-amber-200/80">
                We're still trying — update your payment method to keep Premium.{" "}
                <Link to="/billing" className="underline font-semibold">Update payment</Link>
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-card p-6 text-center">
          <Crown className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-3 font-display text-2xl font-bold text-gradient-primary">
            {isPremium ? "You're Premium" : "Unlock everything"}
          </h2>
          {isPremium ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {plan === "annual" ? "Annual" : "Monthly"} plan
              {until ? ` · renews ${new Date(until).toLocaleDateString()}` : ""}.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Faster learning, no ads, premium voices. Cancel anytime.
            </p>
          )}
        </div>

        <ul className="mt-5 space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-sm ring-1 ring-border">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {!isPremium && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <PlanCard
              label="Monthly"
              price="$4.99"
              period="/mo"
              active={selected === "monthly"}
              onClick={() => setSelected("monthly")}
            />
            <PlanCard
              label="Annual"
              price="$39"
              period="/yr"
              active={selected === "annual"}
              onClick={() => setSelected("annual")}
              badge="Save 35%"
            />
          </div>
        )}

        {!isPremium ? (
          <button
            onClick={startCheckout}
            disabled={busy || loading}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-60"
          >
            {busy || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy || loading ? "Opening checkout…" : "Upgrade to Premium"}
          </button>
        ) : (
          <button
            onClick={() => navigate({ to: "/billing" })}
            className="mt-6 rounded-full bg-surface-2 py-3 font-display text-sm font-bold uppercase tracking-widest ring-1 ring-border"
          >
            Manage subscription
          </button>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] uppercase tracking-widest text-muted-foreground/70">
          <ShieldCheck className="h-3 w-3" /> Secure billing · cancel anytime
        </p>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/60">
          Payments processed by Paddle.com, our Merchant of Record. See our{" "}
          <Link to="/terms" className="underline">Terms</Link>,{" "}
          <Link to="/refund" className="underline">Refund Policy</Link>, and{" "}
          <Link to="/privacy" className="underline">Privacy Notice</Link>.
        </p>
      </main>

      {showWelcome && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5" onClick={() => setShowWelcome(false)}>
          <div
            className="relative w-full max-w-sm rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card to-card p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-surface-2 ring-1 ring-border"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <Crown className="mx-auto h-12 w-12 text-gold" />
            <h2 className="mt-3 font-display text-2xl font-bold text-gradient-primary">
              Welcome to Premium!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ads are gone, premium voices are unlocked, and your daily limit is now unlimited.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold text-gold ring-1 ring-gold/40">
              <Coins className="h-4 w-4" /> +500 coins bonus added
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="mt-5 w-full rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
            >
              Start learning
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function PlanCard({
  label,
  price,
  period,
  active,
  onClick,
  badge,
}: {
  label: string;
  price: string;
  period: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl p-4 text-left ring-1 transition ${
        active ? "bg-primary/10 ring-primary" : "bg-surface-2 ring-border"
      }`}
    >
      {badge && (
        <span className="absolute -top-2 right-2 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black">
          {badge}
        </span>
      )}
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">
        {price}
        <span className="text-xs font-medium text-muted-foreground">{period}</span>
      </p>
    </button>
  );
}
