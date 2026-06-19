import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Calendar, Crown, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { usePremium } from "@/lib/premium";
import { openCustomerPortal } from "@/utils/payments.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/billing")({
  ssr: false,
  component: BillingPage,
});

function BillingPage() {
  const { isPremium, plan, until, loading } = usePremium();
  const portal = useServerFn(openCustomerPortal);
  const [busy, setBusy] = useState(false);

  async function manage() {
    setBusy(true);
    try {
      const res = await portal();
      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
      alert("Could not open the billing portal. Please contact support.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/avatar" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Billing & Subscription</h1>
      </div>

      <div className="mt-6 rounded-3xl bg-surface-2 p-5 ring-1 ring-border">
        <div className="flex items-center gap-3">
          <Crown className={`h-6 w-6 ${isPremium ? "text-gold" : "text-muted-foreground"}`} />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Current plan</p>
            <p className="font-display text-lg font-bold">
              {loading ? "…" : isPremium ? `Premium · ${plan === "annual" ? "Annual" : "Monthly"}` : "Free"}
            </p>
          </div>
        </div>
        {isPremium && until && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> Renews {new Date(until).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-surface-2 ring-1 ring-border">
        <Row icon={<CreditCard className="h-4 w-4" />} label="Payment method" value={isPremium ? "On file" : "—"} />
        <Row icon={<Calendar className="h-4 w-4" />} label="Next billing date" value={isPremium && until ? new Date(until).toLocaleDateString() : "—"} />
      </div>

      {isPremium ? (
        <button
          onClick={manage}
          disabled={busy}
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          {busy ? "Opening…" : "Manage subscription"}
        </button>
      ) : (
        <Link
          to="/premium"
          className="mt-6 block rounded-full bg-primary py-3 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
        >
          Upgrade to Premium
        </Link>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Payments and invoices are handled by Paddle.com (Merchant of Record).
        Need help? Email <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>.
      </p>
    </main>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
