import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LandingPage } from "@/components/landing/LandingPage";

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

