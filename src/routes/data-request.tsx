import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/data-request")({
  ssr: false,
  component: DataRequestPage,
  head: () => ({
    meta: [
      { title: "Data & Account Deletion Requests · Lexiq" },
      {
        name: "description",
        content:
          "Request a copy of your Lexiq data, delete your account, or unsubscribe from Lexiq emails. We confirm within 7 days and complete requests within 30 days.",
      },
      { property: "og:title", content: "Data & Account Deletion Requests · Lexiq" },
      {
        property: "og:description",
        content: "Ask LEXIQ to export or delete your account data, or opt out of emails.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Data & Account Deletion Requests · Lexiq" },
      {
        name: "twitter:description",
        content: "Ask LEXIQ to export or delete your account data, or opt out of emails.",
      },
      { property: "og:url", content: "https://learnlexiq.com/data-request" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/data-request" }],
  }),
});

const deleteMail =
  "mailto:support@learnlexiq.com?subject=" +
  encodeURIComponent("Account deletion request") +
  "&body=" +
  encodeURIComponent(
    "Please delete my Lexiq account and all associated learning data.\n\nAccount email: \n",
  );

const exportMail =
  "mailto:support@learnlexiq.com?subject=" +
  encodeURIComponent("Data export request") +
  "&body=" +
  encodeURIComponent("Please send me a copy of the personal data you hold about me.\n\nAccount email: \n");

const unsubscribeMail =
  "mailto:support@learnlexiq.com?subject=" +
  encodeURIComponent("Unsubscribe from Lexiq emails") +
  "&body=" +
  encodeURIComponent("Please stop sending me product and marketing emails.\n\nAccount email: \n");

function DataRequestPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.history.back()}
          className="text-xs uppercase tracking-widest text-white/60 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="mt-4 font-display text-3xl font-bold">Your data, your choices</h1>
        <p className="mt-2 text-sm text-white/70">
          Email us from the address on your account and we'll confirm receipt within 7 days and finish
          the request within 30 days. There is no charge for any request on this page.
        </p>

        <div className="mt-8 space-y-4">
          <Card
            title="Delete my account"
            body="Erases your account, profile, learning history, streaks, and purchases record (except billing records we must keep for tax law)."
            href={deleteMail}
            cta="Request deletion"
          />
          <Card
            title="Get a copy of my data"
            body="We send a machine-readable export of your profile and learning data."
            href={exportMail}
            cta="Request export"
          />
          <Card
            title="Correct or restrict my data"
            body="Ask us to fix something inaccurate, or to stop a specific kind of processing."
            href={exportMail}
            cta="Contact us"
          />
          <Card
            title="Stop marketing emails"
            body="Every product or marketing email we send also carries a one-click unsubscribe link. Account, security, and billing emails are required and can't be switched off while your account is open."
            href={unsubscribeMail}
            cta="Unsubscribe"
          />
          <Card
            title="Under-16 accounts"
            body="A parent or guardian can ask us to delete a child's account and data. Mention the account email and your relationship to the account holder."
            href={deleteMail}
            cta="Parent/guardian request"
          />
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
          <h2 className="font-display text-base font-bold text-white">Who you're contacting</h2>
          <p className="mt-2">
            LEXIQ — operator of learnlexiq.com and data controller for your account data.
            <br />
            Privacy & support: <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>
            <br />
            Security reports: <a className="underline" href="mailto:security@learnlexiq.com">security@learnlexiq.com</a>
            <br />
            Billing is handled by Paddle.com, our Merchant of Record.
          </p>
          <p className="mt-3">
            See also our{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
            ,{" "}
            <Link to="/cookies" className="underline">
              Cookie Policy
            </Link>
            , and{" "}
            <Link to="/terms" className="underline">
              Terms
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

function Card({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="font-display text-base font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{body}</p>
      <a
        href={href}
        className="mt-3 inline-flex rounded-full border border-white/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {cta}
      </a>
    </section>
  );
}
