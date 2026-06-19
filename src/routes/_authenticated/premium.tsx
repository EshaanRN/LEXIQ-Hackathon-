import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Sparkles, ShieldCheck } from "lucide-react";
import { usePremium } from "@/lib/premium";

export const Route = createFileRoute("/_authenticated/premium")({
  ssr: false,
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
  const { isPremium, plan, until } = usePremium();
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/avatar" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Lexiq Premium</h1>
      </div>

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
            Faster learning, no ads, and premium voices. Cancel anytime.
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
          <Plan label="Monthly" price="$4.99" period="/mo" highlight={false} />
          <Plan label="Annual" price="$39" period="/yr" highlight badge="Save 35%" />
        </div>
      )}

      {!isPremium ? (
        <button
          onClick={() =>
            alert("Premium checkout will activate once payments are connected. Your account is ready.")
          }
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade to Premium
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
    </main>
  );
}

function Plan({
  label,
  price,
  period,
  highlight,
  badge,
}: {
  label: string;
  price: string;
  period: string;
  highlight: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-4 ring-1 ${
        highlight ? "bg-primary/10 ring-primary/40" : "bg-surface-2 ring-border"
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
    </div>
  );
}
