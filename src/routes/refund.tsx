import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  ssr: false,
  component: RefundPage,
  head: () => ({
    meta: [
      { title: "Refund Policy · Lexiq" },
      { name: "description", content: "Lexiq 30-day money-back guarantee. Request a refund via Paddle, our Merchant of Record." },
      { property: "og:title", content: "Refund Policy · Lexiq" },
      { property: "og:description", content: "30-day money-back guarantee on Lexiq Premium subscriptions." },
      { property: "og:url", content: "https://learnlexiq.com/refund" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/refund" }],
  }),
});

function RefundPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.history.back()} className="text-xs uppercase tracking-widest text-white/60 hover:text-white">
          ← Back
        </button>
        <h1 className="mt-4 font-display text-3xl font-bold">Refund Policy</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: June 19, 2026</p>
        <p className="mt-2 text-xs text-white/60">
          See also: <Link to="/terms" className="underline">Terms</Link> ·{" "}
          <Link to="/privacy" className="underline">Privacy</Link>
        </p>

        <section className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-white/80">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">30-day money-back guarantee</h2>
            <p className="mt-2">
              We want you to be confident in Lexiq Premium. If you are not satisfied with your purchase,
              you can request a full refund within <strong>30 days</strong> of your order date — no
              questions asked.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-white">How to request a refund</h2>
            <p className="mt-2">
              Refunds are processed by our payment provider and Merchant of Record,{" "}
              <a href="https://www.paddle.com/" target="_blank" rel="noopener noreferrer" className="underline">
                Paddle.com
              </a>
              . You can:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Visit{" "}
                <a href="https://www.paddle.net/" target="_blank" rel="noopener noreferrer" className="underline">
                  paddle.net
                </a>{" "}
                to look up your order and request a refund directly, or
              </li>
              <li>
                Email us at{" "}
                <a href="mailto:support@learnlexiq.com" className="underline">
                  support@learnlexiq.com
                </a>{" "}
                and we will help you within 2 business days.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-white">Subscription cancellation</h2>
            <p className="mt-2">
              You can cancel your subscription at any time from the Billing screen inside the app. After
              cancellation, your Premium access remains active until the end of your current billing
              period. You will not be charged again.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-white">After the 30-day window</h2>
            <p className="mt-2">
              Refunds beyond 30 days are considered on a case-by-case basis (for example, accidental
              renewals or technical issues that prevented use of the service). Contact support and we
              will do our best to make it right.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
