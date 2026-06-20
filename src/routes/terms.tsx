import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  ssr: false,
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service · Lexiq" },
      { name: "description", content: "Lexiq Terms of Service: accounts, acceptable use, subscriptions, intellectual property, advertising, disclaimers, and limitation of liability." },
      { property: "og:title", content: "Terms of Service · Lexiq" },
      { property: "og:description", content: "The agreement between you and Lexiq when you use our SAT & ACT vocabulary app." },
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
        <button onClick={() => router.history.back()} className="text-xs uppercase tracking-widest text-white/60 hover:text-white">
          ← Back
        </button>
        <h1 className="mt-4 font-display text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: June 19, 2026</p>
        <p className="mt-2 text-xs text-white/60">
          See also: <Link to="/privacy" className="underline">Privacy Policy</Link> ·{" "}
          <Link to="/cookies" className="underline">Cookie Policy</Link> ·{" "}
          <Link to="/trust" className="underline">Trust & Security</Link>
        </p>

        <section className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-white/80">
          <Block title="1. Acceptance of Terms">
            By creating a Lexiq account or using LearnLexiq (the "Service") you agree to these Terms of Service ("Terms")
            and our <Link to="/privacy" className="underline">Privacy Policy</Link>. If you do not agree, do not use the
            Service. These Terms form a binding contract between you and LEXIQ ("Lexiq", "we", "us", "our"), the legal
            entity operating the Service.
          </Block>

          <Block title="2. Eligibility & accounts">
            You must be at least 13 years old (or the digital-consent age in your country) to create an account. You are
            responsible for the accuracy of your registration information, for keeping your credentials secure, and for
            any activity under your account. Notify us immediately of any unauthorized use.
          </Block>

          <Block title="3. Google Sign-In and third-party authentication">
            When you sign in with Google you authorize Google to share your basic profile fields (email, name, picture)
            with us. We do not receive your Google password. Your use of Google Sign-In is also subject to Google's terms
            and privacy policy. You may revoke our access from your Google Account at any time.
          </Block>

          <Block title="4. Acceptable use">
            You agree not to:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Reverse engineer, decompile, or attempt to extract source code, except where allowed by law.</li>
              <li>Scrape, crawl, or harvest data from the Service except via features we expose for that purpose.</li>
              <li>Interfere with, overload, or disrupt the Service or any user's use of it.</li>
              <li>Use the Service to harass, defraud, or harm others, or to violate any law.</li>
              <li>Resell, sublicense, or commercially exploit the Service without our written permission.</li>
              <li>Bypass technical limits, rate limits, paywalls, or advertising.</li>
            </ul>
            We may suspend or terminate accounts that violate these rules, with or without notice.
          </Block>

          <Block title="5. Your content & learning data">
            You retain ownership of content you submit (e.g. username, avatar choices, notes). You grant Lexiq a
            worldwide, non-exclusive, royalty-free license to host, process, transmit, display, and back up that content
            solely to operate, secure, and improve the Service. You represent that you have the rights necessary to
            grant this license and that your content does not infringe any third party's rights.
          </Block>

          <Block title="6. Intellectual property">
            The Service — including its software, design, branding, vocabulary curation, lesson structure, audio output,
            and Lexiq trademarks — is owned by Lexiq and its licensors and is protected by intellectual-property laws.
            We grant you a personal, non-transferable, revocable license to use the Service for your own non-commercial
            study. No other rights are granted by implication.
          </Block>

          <Block title="7. Premium, subscriptions & payments (Merchant of Record)">
            Lexiq may offer Premium subscriptions and digital purchases. Pricing, features, and availability are shown
            at checkout and may change with notice.
            <p className="mt-2">
              <strong>Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of
              Record for all our orders. Paddle provides all customer service inquiries and handles returns, billing
              support, and sales tax collection and remittance.</strong> Payment, billing, taxes, cancellation and
              refund mechanics are governed by the{" "}
              <a className="underline" href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer">
                Paddle Checkout Buyer Terms
              </a>{" "}
              in addition to these Terms.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Subscriptions renew automatically at the end of each billing period until cancelled.</li>
              <li>You can cancel anytime from the Billing screen; access continues until the end of the current period.</li>
              <li>We offer a 30-day money-back guarantee — see our <Link to="/refund" className="underline">Refund Policy</Link>.</li>
              <li>EEA/UK consumers may withdraw within 14 days unless they have begun consuming the digital content with prior consent.</li>
              <li>Applicable taxes are calculated and collected by Paddle at checkout.</li>
            </ul>
            We do not store full card numbers. Card and bank details are handled by Paddle.
          </Block>


          <Block title="8. Advertising">
            The free tier of the Service is supported by advertising. We aim to keep ads non-intrusive and never to
            interrupt active tests, checkpoints, or onboarding. Ads are clearly labeled as "Sponsored". Ad networks we
            work with may set their own cookies and process limited data (e.g. coarse location, device type) under their
            own privacy policies. Premium subscribers see no ads.
          </Block>

          <Block title="9. User conduct guidelines">
            Treat other users and our support staff with respect. Do not impersonate others, post unlawful content, or
            use avatars/usernames that are hateful, sexual, threatening, or that infringe trademarks. We may remove
            content and suspend accounts that violate these guidelines.
          </Block>

          <Block title="10. Educational disclaimer">
            Lexiq is a study aid. We do not guarantee any particular SAT, ACT, or other exam score. The Service is
            provided as one of many resources you should use alongside official preparation materials.
          </Block>

          <Block title="11. Service availability">
            We strive for high availability but do not guarantee uninterrupted service. We may modify, suspend, or
            discontinue features at any time. Where a paid feature is materially reduced, eligible subscribers may
            receive a pro-rata refund or credit at our discretion.
          </Block>

          <Block title="12. Account termination & data deletion">
            You may delete your account at any time by emailing <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>
            from your registered address. We will erase your personal data within 30 days, except where retention is
            required for legal, tax, security, or fraud-prevention purposes. We may terminate or suspend your account
            for material breach of these Terms or where required by law.
          </Block>

          <Block title="13. Disclaimers">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
            INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Nothing in this section
            limits any warranty that cannot be excluded under applicable law (including consumer-protection laws in your
            jurisdiction).
          </Block>

          <Block title="14. Limitation of liability">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEXIQ AND ITS AFFILIATES WILL NOT BE LIABLE FOR INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, GOODWILL, OR DATA. OUR TOTAL
            LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE
            AMOUNTS YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM, OR (B) USD $50. Some jurisdictions do not allow these
            limits, so they may not apply to you.
          </Block>

          <Block title="15. Indemnity">
            You will indemnify and hold Lexiq harmless from any claim, loss, or expense (including reasonable legal
            fees) arising from your misuse of the Service, your breach of these Terms, or your violation of any law or
            third-party right.
          </Block>

          <Block title="16. Changes to the Terms">
            We may update these Terms from time to time. Material changes will be announced in-app or by email at least
            14 days before they take effect. Continued use after the effective date constitutes acceptance.
          </Block>

          <Block title="17. Governing law & disputes">
            These Terms are governed by the laws of the jurisdiction in which Lexiq is established, without regard to
            its conflict-of-laws principles. Disputes will be resolved in the competent courts of that jurisdiction,
            except where mandatory consumer-protection law of your country of residence grants you the right to bring
            proceedings locally.
          </Block>

          <Block title="18. Contact">
            Questions about these Terms or your account: <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>.
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
