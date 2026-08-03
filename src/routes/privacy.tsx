import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  ssr: false,
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy · Lexiq" },
      { name: "description", content: "How Lexiq collects, uses, stores, and protects your data — including Google Sign-In, learning progress, cookies, and account deletion." },
      { property: "og:title", content: "Privacy Policy · Lexiq" },
      { property: "og:description", content: "How Lexiq handles your data and privacy." },
      { property: "og:url", content: "https://learnlexiq.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/privacy" }],
  }),
});

function PrivacyPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.history.back()} className="text-xs uppercase tracking-widest text-white/60 hover:text-white">
          ← Back
        </button>
        <h1 className="mt-4 font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: June 19, 2026</p>

        <section className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-white/80">
          <Block title="1. Who we are">
            LEXIQ ("Lexiq", "we", "us", "our") is the legal entity that operates the LearnLexiq vocabulary learning service available at
            learnlexiq.com (the "Service") and acts as the data controller for personal data described in this notice. You can contact us at <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>
            for any privacy question, including data access, correction, or deletion requests.
          </Block>

          <Block title="2. What we collect">
            <strong className="block text-white">Email address.</strong>
            We require your email address to create your account, sign you in, verify ownership, recover access if you
            forget your password, send security alerts, and (with your separate consent) send optional product updates.
            You can't use Lexiq without an email on file because it is the identifier we use to keep your learning
            progress tied to you across devices.
            <strong className="mt-3 block text-white">Microphone audio (Speaking Mode).</strong>
            When you choose Speaking Mode in a checkpoint, your browser will prompt you for microphone permission. If
            you allow it, we capture short audio clips of you pronouncing the target vocabulary word and send the
            resulting speech-to-text transcript (not the raw audio) to our AI grader to score your pronunciation. We do
            not record continuous audio, we do not access your microphone outside of an active Speaking question, and
            we do not store the raw audio after the transcript is produced. You can deny or revoke microphone
            permission at any time in your browser settings — Typing Mode works without it.
            <strong className="mt-3 block text-white">Account information.</strong>
            When you sign in with Google, we also receive your Google display name, profile picture, and an opaque
            user identifier. We never receive or store your Google password.
            <strong className="mt-3 block text-white">Profile and learning data.</strong>
            Username, avatar selection, equipped items, exam target (SAT or ACT), daily goals, words learned, mastery
            scores, streaks, XP, coins, owned items, checkpoint results, speaking-mode transcripts and scores, and
            review flags.
            <strong className="mt-3 block text-white">Device and usage data.</strong>
            IP address, browser type, device model, operating system, referring URLs, pages viewed, and crash diagnostics
            collected automatically for security and reliability.
            <strong className="mt-3 block text-white">Cookies and local storage.</strong>
            See our <a className="underline" href="/cookies">Cookie Policy</a>.
          </Block>

          <Block title="2a. Device permissions we may request">
            Lexiq runs in your browser and only uses the permissions strictly needed for the feature you're using:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Microphone</strong> — used only while you are in Speaking Mode on a checkpoint, to capture your pronunciation of the target word. Required if you want speaking practice; optional otherwise.</li>
              <li><strong>Audio output (speaker)</strong> — used to play AI-generated pronunciations of vocabulary words. No permission prompt is needed.</li>
              <li><strong>Local storage / cookies</strong> — used to keep you signed in, cache offline progress, and remember your preferences. See the <a className="underline" href="/cookies">Cookie Policy</a>.</li>
              <li><strong>Notifications, camera, location, contacts, files</strong> — Lexiq does <em>not</em> request these. If your browser ever prompts you for them while using Lexiq, deny the request and contact <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>.</li>
            </ul>
            You can revoke any browser permission at any time from your browser's site settings without losing your account.
          </Block>

          <Block title="3. How we use your data">
            We process your data only to:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Operate, secure, and personalize the Service.</li>
              <li>Save and sync your learning progress across devices.</li>
              <li>Generate audio pronunciations through our AI provider.</li>
              <li>Communicate with you about your account, security, and (with consent) product updates.</li>
              <li>Detect, prevent, and respond to abuse, fraud, and security incidents.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            We do not sell your personal information and we do not use your learning data to train third-party AI models.
          </Block>

          <Block title="4. Google Sign-In">
            When you choose Google Sign-In we receive the basic profile fields you authorize (email, name, picture) and
            an opaque user identifier. We use these solely to create and authenticate your Lexiq account. You can revoke
            this access at any time from your Google Account &rarr; Security &rarr; Third-party apps.
          </Block>

          <Block title="5. Subprocessors and data sharing">
            We share data with the following categories of service providers strictly to operate the Service:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Hosting & database:</strong> managed cloud infrastructure (edge hosting, managed Postgres, and managed authentication).</li>
              <li><strong>AI pronunciation:</strong> our AI gateway, routing to OpenAI for text-to-speech.</li>
              <li><strong>Identity:</strong> Google (for Google Sign-In).</li>
              <li>
                <strong>Payments and Merchant of Record:</strong>{" "}
                <a className="underline" href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer">Paddle.com</a>{" "}
                processes all payments, subscription management, invoicing, and sales-tax compliance for Lexiq Premium.
                When you check out, Paddle acts as data controller for billing data (name, billing address, payment
                method, transaction history) under their own privacy notice. We receive limited information from Paddle
                (a customer ID, subscription status, plan, and renewal dates) to grant you access to Premium features.
              </li>
              <li><strong>Advertising:</strong> the free tier may show ads from ad networks that set their own cookies and process limited data (device type, coarse location) under their own privacy policies. See our <a className="underline" href="/cookies">Cookie Policy</a>.</li>
            </ul>
          </Block>


          <Block title="6. Legal bases (GDPR / UK GDPR)">
            We rely on (a) <em>contract</em> to provide the Service you requested, (b) <em>legitimate interests</em> to
            secure the Service and improve features, (c) <em>consent</em> for optional cookies and marketing email, and
            (d) <em>legal obligation</em> where required.
          </Block>

          <Block title="7. Data retention">
            Account and learning data are kept while your account is active. If you delete your account, we erase your
            personal data within 30 days, except where retention is required by law (e.g. tax records for paid plans) or
            for security investigations. Aggregated, de-identified statistics may be kept indefinitely.
          </Block>

          <Block title="8. Account deletion & data export">
            You can request account deletion or a copy of your data at any time by emailing
            <a className="underline" href="mailto:support@learnlexiq.com"> support@learnlexiq.com</a> from the address on
            your account. We confirm receipt within 7 days and complete the request within 30 days.
          </Block>

          <Block title="9. Your rights">
            Depending on where you live you may have the right to access, correct, delete, port, or restrict the
            processing of your data, to object to processing, and to lodge a complaint with your local supervisory
            authority. California residents have analogous rights under the CCPA/CPRA, including the right to opt out of
            "sales" or "sharing" of personal information — we do not sell or share personal information as those terms
            are defined.
          </Block>

          <Block title="10. Children">
            Lexiq is intended for users 13 and older. If you are between 13 and 16 (or the digital-consent age in your
            country), you confirm that a parent or guardian has approved your use. We do not knowingly collect data from
            children under 13; contact us and we will delete it.
          </Block>

          <Block title="11. International transfers">
            Our hosting providers may store and process data in the United States and the European Union. When personal
            data of EEA/UK residents is transferred outside their jurisdiction, we rely on the European Commission's
            Standard Contractual Clauses or another approved transfer mechanism.
          </Block>

          <Block title="12. Security">
            We use TLS in transit, encryption at rest, scoped row-level security on the database, and least-privilege
            service credentials. No system is 100% secure; if we become aware of a breach affecting your data we will
            notify you and the relevant authorities within the timelines required by law.
          </Block>

          <Block title="13. Changes to this policy">
            We will post any material change here and update the "Last updated" date. If the change is significant we
            will notify you in-app or by email before it takes effect.
          </Block>

          <Block title="14. Contact">
            Questions or requests: <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>.
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
      <div className="mt-2">{children}</div>
    </div>
  );
}
