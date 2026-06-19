import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  ssr: false,
  component: CookiesPage,
  head: () => ({
    meta: [
      { title: "Cookie Policy · Lexiq" },
      { name: "description", content: "How Lexiq uses cookies and local browser storage for sign-in, preferences, security, and (optionally) analytics and ads." },
      { property: "og:title", content: "Cookie Policy · Lexiq" },
      { property: "og:url", content: "https://learnlexiq.com/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/cookies" }],
  }),
});

function CookiesPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.history.back()} className="text-xs uppercase tracking-widest text-white/60 hover:text-white">
          ← Back
        </button>
        <h1 className="mt-4 font-display text-3xl font-bold">Cookie Policy</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: June 19, 2026</p>

        <section className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-white/80">
          <Block title="What cookies are">
            Cookies are small text files stored by your browser. We also use <em>local storage</em> and <em>session
            storage</em>, which work similarly but stay on your device. This policy uses "cookies" to mean all three.
          </Block>

          <Block title="Cookies we use">
            <Row name="Strictly necessary" purpose="Keeps you signed in (Supabase session), remembers your in-app preferences (theme, daily goal, learning progress), and protects against abuse. The Service cannot function without these." consent="Always on" />
            <Row name="Functional" purpose="Remembers minor UI state such as the splash being shown and your active-time counter for the ad cadence." consent="Always on" />
            <Row name="Analytics (future)" purpose="Aggregated usage data to improve the Service. Not enabled today; if added we will request consent first where required." consent="Opt-in (EEA/UK)" />
            <Row name="Advertising (future)" purpose="If we partner with an ad network, that network may set its own cookies. You will see a consent banner where required, and Premium users see no ads at all." consent="Opt-in (EEA/UK)" />
          </Block>

          <Block title="Managing cookies">
            You can clear cookies and local storage at any time from your browser settings. Disabling strictly-necessary
            cookies will sign you out and prevent the Service from saving your progress. To opt out of Google's ads
            personalization across the web, visit <a className="underline" href="https://adssettings.google.com" target="_blank" rel="noreferrer">adssettings.google.com</a>.
          </Block>

          <Block title="Do Not Track">
            We honor "Global Privacy Control" (GPC) signals where required by law and do not sell or share personal
            information as defined by the CCPA/CPRA.
          </Block>

          <Block title="Contact">
            Questions: <a className="underline" href="mailto:support@learnlexiq.com">support@learnlexiq.com</a>.
          </Block>
        </section>
      </div>
    </main>
  );
}

function Row({ name, purpose, consent }: { name: string; purpose: string; consent: string }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-sm font-bold text-white">{name}</p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/70">
          {consent}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/70">{purpose}</p>
    </div>
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
