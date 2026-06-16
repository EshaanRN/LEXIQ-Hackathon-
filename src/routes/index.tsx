import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Sparkles, Target, Brain, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lexiq | SAT & ACT Vocabulary Learning App" },
      {
        name: "description",
        content:
          "Lexiq helps students master SAT and ACT vocabulary using smart flashcards, memory tools, and personalized learning designed to improve test scores.",
      },
      {
        property: "og:title",
        content: "LearnLexiq — AI-Powered SAT Vocabulary Learning",
      },
      {
        property: "og:description",
        content:
          "Master SAT and ACT vocabulary through interactive swiping. Personalized learning, progress tracking, and AI-powered checkpoints.",
      },
      { property: "og:url", content: "https://learnlexiq.com/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "LearnLexiq",
          url: "https://learnlexiq.com",
          description:
            "AI-powered SAT and ACT vocabulary learning through interactive swiping.",
          publisher: {
            "@type": "Organization",
            name: "LearnLexiq",
            url: "https://learnlexiq.com",
          },
        }),
      },
    ],
  }),
  component: HomePage,
});

type AuthState = "checking" | "authed" | "guest";

function HomePage() {
  const navigate = useNavigate();
  const navigatedRef = useRef(false);
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      // Dynamic import avoids SSR issues with browser-only Supabase client
      const { supabase } = await import("@/integrations/supabase/client");

      function go(dest: "/welcome" | "/app" | "/onboarding") {
        if (cancelled || navigatedRef.current) return;
        navigatedRef.current = true;
        navigate({ to: dest, replace: true });
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session) {
        setAuthState("guest");
        return;
      }

      // Signed in — resolve onboarding vs app
      try {
        const profilePromise = supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", data.session.user.id)
          .maybeSingle();
        const result = await Promise.race([
          profilePromise,
          new Promise<{ data: null }>((resolve) =>
            setTimeout(() => resolve({ data: null }), 1500),
          ),
        ]);
        const profile = (result as { data: { onboarding_complete?: boolean } | null }).data;
        const dest = profile?.onboarding_complete ? "/app" : "/onboarding";
        go(dest);
      } catch {
        go("/onboarding");
      }
    }

    checkAuth();

    const hardTimeout = setTimeout(() => {
      if (cancelled || navigatedRef.current) return;
      setAuthState("guest");
    }, 4000);

    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
    };
  }, [navigate]);

  // While checking auth, show loading overlay on top of the landing content
  // so crawlers (and users with JS off) still see the content in the DOM.
  const isRedirecting = authState === "checking" || authState === "authed";

  return (
    <>
      {isRedirecting && <LoadingScreen message="Loading Lexiq…" />}
      <LandingPage />
    </>
  );
}

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background orbs — matches the existing app design */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-80px] h-[420px] w-[420px] rounded-full bg-accent/25 blur-[140px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-surface-2/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground ring-1 ring-border backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-Powered SAT &amp; ACT Prep
        </div>

        <h1 className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          LearnLexiq
        </h1>

        <p className="mt-4 max-w-xl text-xl font-medium text-primary sm:text-2xl">
          AI-powered SAT vocabulary learning through interactive swiping
        </p>

        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          Master the high-frequency words that show up on the SAT and ACT through
          an addictive, swipe-based learning experience. Our AI personalizes
          every session to your level so you learn faster and retain longer.
        </p>

        <div className="mt-10 grid w-full max-w-md gap-3 text-left">
          <FeatureBullet
            icon={<Target className="h-5 w-5" />}
            title="Swipe-based vocabulary learning"
            description="Right if you know it, left to learn it. One word at a time."
          />
          <FeatureBullet
            icon={<Brain className="h-5 w-5" />}
            title="SAT word practice and review"
            description="2,000+ high-frequency test words sourced from real SAT and ACT releases."
          />
          <FeatureBullet
            icon={<Sparkles className="h-5 w-5" />}
            title="Personalized learning system"
            description="AI placement quiz tunes your deck to your exact level — no wasted reps."
          />
          <FeatureBullet
            icon={<TrendingUp className="h-5 w-5" />}
            title="Progress tracking"
            description="XP, streaks, ranks, and detailed stats to keep you motivated."
          />
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/welcome"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.03] glow-primary"
          >
            Get started — free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/auth"
            className="rounded-full px-6 py-3.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            I already have an account →
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          No credit card required. Built for students, by students.
        </p>
      </div>
    </main>
  );
}

function FeatureBullet({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm transition hover:border-primary/30">
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-base font-bold">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
