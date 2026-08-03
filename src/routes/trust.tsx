import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/trust")({
  ssr: false,
  component: TrustPage,
  head: () => ({
    meta: [
      { title: "Trust & Security · Lexiq" },
      {
        name: "description",
        content:
          "Learn how Lexiq protects your account and learning data — authentication, hosting, data practices, and how to contact us about security or privacy.",
      },
      { property: "og:title", content: "Trust & Security · Lexiq" },
      {
        property: "og:description",
        content:
          "How Lexiq handles security, privacy, and data — maintained by the Lexiq team.",
      },
      { property: "og:url", content: "https://learnlexiq.com/trust" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/trust" }],
  }),
});

function TrustPage() {
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
        <h1 className="mt-4 font-display text-3xl font-bold">Trust & Security</h1>
        <p className="mt-2 text-sm text-white/60">
          This page is maintained by the Lexiq team to answer common security and privacy
          questions about Lexiq. It is editable app content, not an independent certification
          or audit.
        </p>

        <div className="mt-8 space-y-5">
          <Block title="Accounts & authentication">
            Lexiq accounts are protected by email/password sign-in and optional Google sign-in.
            Sessions are managed by our authentication provider and stored securely in the
            browser. You can sign out at any time from the app.
          </Block>

          <Block title="Hosting & platform">
            Lexiq runs on managed cloud infrastructure that provides hosting, the application
            database, authentication, and serverless functions. This describes enabled platform
            capabilities; it is not a third-party certification.
          </Block>

          <Block title="Data we store">
            We store the information you provide to use Lexiq: your account email, profile
            details you set (such as display name and avatar), your learning progress, goals,
            and in-app preferences. We do not sell your personal information.
          </Block>

          <Block title="Data access controls">
            Your learning data is scoped to your account. Database access rules are configured
            so that users can only read and write their own rows through the app.
          </Block>

          <Block title="Subprocessors & integrations">
            Lexiq uses managed cloud providers (hosting, database, auth, serverless functions)
            and an AI provider routed through our AI gateway to generate pronunciations and
            learning content. Voice and text requests are sent to that gateway to produce a response and are not
            used to identify you to third parties by Lexiq.
          </Block>

          <Block title="Cookies & analytics">
            Lexiq uses cookies and local browser storage required for sign-in and to remember
            your in-app settings and progress.
          </Block>

          <Block title="Retention & deletion">
            We keep your account data while your account is active. To request deletion of your
            account and associated learning data, contact us at the address below.
          </Block>

          <Block title="Shared responsibility">
            Lexiq is responsible for the application code and configuration. Our cloud
            infrastructure providers are responsible for the underlying hosting, database, and auth
            infrastructure. You are responsible for keeping your login credentials secure and
            for the content you submit.
          </Block>

          <Block title="Reporting a security issue">
            If you believe you've found a security or privacy issue in Lexiq, please email
            <span className="text-white"> security@learnlexiq.com</span> with steps to
            reproduce. We'll review and respond.
          </Block>

          <Block title="More information">
            See our{" "}
            <Link to="/terms" className="text-primary underline">
              Terms & Privacy
            </Link>{" "}
            for the full policy covering accounts, acceptable use, and data practices.
          </Block>
        </div>
      </div>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/80">{children}</p>
    </section>
  );
}
