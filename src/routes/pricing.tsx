import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pricing · Lexiq" },
      {
        name: "description",
        content:
          "Lexiq pricing: a generous free plan plus optional Premium at $4.99/month or $39/year for AI checkpoints, custom tests, and adaptive SAT practice.",
      },
      { property: "og:title", content: "Pricing · Lexiq" },
      {
        property: "og:description",
        content: "Free forever, with optional Premium at $4.99/month or $39/year.",
      },
      { property: "og:url", content: "https://learnlexiq.com/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/pricing" }],
  }),
  component: PricingPage,
});

function PricingPage() {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-white">
      <button
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <header className="mt-6 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, honest pricing
        </h1>
        <p className="mt-3 text-white/70">
          Start free. Upgrade only if you want the AI-powered extras.
        </p>
        <p className="mt-2 text-xs text-white/50">
          Payments are processed by our reseller Paddle.com (Merchant of Record).
        </p>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <PlanCard
          name="Free"
          price="$0"
          cadence="forever"
          cta="Get started"
          ctaTo="/auth"
          features={[
            "Full SAT & ACT word library",
            "Personalized swipe deck",
            "Streaks, XP, ranks, coins",
            "Basic checkpoints",
          ]}
        />
        <PlanCard
          name="Premium · Monthly"
          price="$4.99"
          cadence="per month"
          cta="Upgrade"
          ctaTo="/auth"
          features={[
            "Everything in Free",
            "AI checkpoints (define, use, say)",
            "Custom tests from your word lists",
            "Adaptive SAT practice on weak words",
            "Instant per-answer speech grading",
            "Cancel anytime",
          ]}
        />
        <PlanCard
          name="Premium · Annual"
          price="$39"
          cadence="per year"
          highlight
          badge="Save 35%"
          cta="Upgrade"
          ctaTo="/auth"
          features={[
            "Everything in Monthly",
            "Two months free vs monthly",
            "Priority support",
            "30-day money-back guarantee",
          ]}
        />
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/70">
        <h2 className="font-display text-lg font-bold text-white">Billing, refunds & cancellation</h2>
        <p className="mt-2">
          Subscriptions renew automatically until cancelled. You can cancel anytime from your
          billing portal. We offer a 30-day money-back guarantee — see our{" "}
          <Link to="/refund" className="underline">Refund Policy</Link> for details. By subscribing
          you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and{" "}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/50">
        <Link to="/terms" className="hover:text-white">Terms</Link>
        <Link to="/privacy" className="hover:text-white">Privacy</Link>
        <Link to="/refund" className="hover:text-white">Refunds</Link>
        <Link to="/cookies" className="hover:text-white">Cookies</Link>
        <span>© {new Date().getFullYear()} LEXIQ</span>
      </footer>
    </main>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  features,
  cta,
  ctaTo,
  highlight,
  badge,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  ctaTo: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-3xl border p-6 ${
        highlight
          ? "border-primary/50 bg-primary/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
          <Sparkles className="h-3 w-3" /> {badge}
        </span>
      )}
      <h3 className="font-display text-xl font-bold">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold">{price}</span>
        <span className="text-sm text-white/60">/ {cadence}</span>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-white/80">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to={ctaTo}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
          highlight
            ? "bg-primary text-primary-foreground hover:scale-[1.02]"
            : "bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
