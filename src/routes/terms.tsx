import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  ssr: false,
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Privacy · Lexiq" },
      { name: "description", content: "Read the Lexiq Terms of Service and Privacy Policy covering accounts, acceptable use, data storage, and your rights." },
      { property: "og:title", content: "Terms & Privacy · Lexiq" },
      { property: "og:description", content: "Lexiq Terms of Service and Privacy Policy — accounts, acceptable use, and data practices." },
      { property: "og:url", content: "https://learnlexiq.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/terms" }],
  }),
});

function TermsPage() {
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
        <h1 className="mt-4 font-display text-3xl font-bold">Terms & Privacy</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: June 6, 2026</p>


        <section className="mt-8 max-h-[70vh] space-y-6 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-white/80">
          <Block title="1. Acceptance of Terms">
            By creating a Lexiq account or using the app you agree to these Terms and our Privacy
            Policy. If you do not agree, do not use Lexiq.
          </Block>
          <Block title="2. Your Account">
            You are responsible for the security of your login credentials and any activity on your
            account. You must be at least 13 years old to use Lexiq. Provide accurate information and
            keep it up to date.
          </Block>
          <Block title="3. Acceptable Use">
            Do not abuse, reverse engineer, scrape, or attempt to disrupt Lexiq. Do not use Lexiq for
            unlawful activity or to harm other users. We may suspend or terminate accounts that
            violate these terms.
          </Block>
          <Block title="4. Content & Learning Data">
            Lexiq stores study progress, XP, streaks, and avatar selections to power your experience.
            You retain ownership of personal content you submit. You grant Lexiq a limited license to
            process this data to provide and improve the service.
          </Block>
          <Block title="5. Privacy">
            We collect the minimum data needed to run Lexiq: email, authentication identifiers,
            study progress, and basic device metadata. We do not sell personal information. Data is
            stored on secure cloud infrastructure with row-level access policies. You can request
            account deletion at any time by contacting support.
          </Block>
          <Block title="6. Cookies & Storage">
            Lexiq uses browser storage to keep you signed in and to cache study state for offline-like
            performance. Disabling storage may break core features.
          </Block>
          <Block title="7. Subscriptions & Purchases">
            Cosmetic items and premium features may be offered for purchase. All sales are final
            except where required by law. Pricing and availability may change.
          </Block>
          <Block title="8. Disclaimers">
            Lexiq is provided “as is.” We do not guarantee any specific SAT or ACT score outcome.
            Use the app as one of many study resources.
          </Block>
          <Block title="9. Limitation of Liability">
            To the maximum extent permitted by law, Lexiq is not liable for indirect, incidental, or
            consequential damages arising from your use of the service.
          </Block>
          <Block title="10. Changes">
            We may update these terms. Material changes will be communicated in-app. Continued use
            after changes means you accept the updated terms.
          </Block>
          <Block title="11. Contact">
            Questions about these terms or your data? Contact support through the in-app help menu.
          </Block>
        </section>
      </div>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-base font-bold text-white">{title}</h2>
      <p className="mt-2">{children}</p>
    </div>
  );
}
