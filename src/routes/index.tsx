import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Splash } from "@/components/Splash";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  component: SplashGate,
});

const SPLASH_SHOWN_KEY = "lexiq:splash-shown";

type Dest = "/auth" | "/app" | "/onboarding";

async function resolveDestination(): Promise<Dest> {
  // Prefer getSession (reads from localStorage, no network) so we don't hang on flaky networks.
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return "/auth";

  try {
    const profilePromise = supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();
    // Cap the profile lookup at 2.5s — if it stalls, treat as not-onboarded.
    const result = await Promise.race([
      profilePromise,
      new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 2500),
      ),
    ]);
    const profile = (result as { data: { onboarding_complete?: boolean } | null }).data;
    return profile?.onboarding_complete ? "/app" : "/onboarding";
  } catch {
    return "/onboarding";
  }
}

function SplashGate() {
  const navigate = useNavigate();
  const navigatedRef = useRef(false);
  const [tagline, setTagline] = useState("Swipe. Learn. Level up.");
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const alreadyShown =
      typeof window !== "undefined" &&
      sessionStorage.getItem(SPLASH_SHOWN_KEY) === "1";
    const minDelay = alreadyShown ? 0 : 1000;
    const start = Date.now();

    function go(dest: Dest) {
      if (cancelled || navigatedRef.current) return;
      navigatedRef.current = true;
      try {
        sessionStorage.setItem(SPLASH_SHOWN_KEY, "1");
      } catch {}
      navigate({ to: dest, replace: true });
    }

    // Hard safety net: never let splash live past 5s.
    const hardTimeout = setTimeout(() => {
      if (cancelled || navigatedRef.current) return;
      setStuck(true);
      go("/auth");
    }, 5000);

    // Stuck indicator after 3s
    const stuckHint = setTimeout(() => {
      if (!cancelled && !navigatedRef.current) setStuck(true);
    }, 3000);

    (async () => {
      let dest: Dest = "/auth";
      try {
        dest = await resolveDestination();
      } catch (e) {
        console.error("[startup] failed", e);
        setTagline("Reconnecting…");
      }
      if (cancelled) return;
      const wait = Math.max(0, minDelay - (Date.now() - start));
      setTimeout(() => go(dest), wait);
    })();

    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
      clearTimeout(stuckHint);
    };
  }, [navigate]);

  return (
    <>
      <Splash tagline={tagline} />
      {stuck && (
        <div className="fixed inset-x-0 bottom-10 z-[101] flex justify-center px-4">
          <button
            onClick={() => {
              try {
                sessionStorage.setItem(SPLASH_SHOWN_KEY, "1");
              } catch {}
              navigate({ to: "/auth", replace: true });
            }}
            className="rounded-full bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 backdrop-blur transition hover:bg-white/20"
          >
            Continue
          </button>
        </div>
      )}
    </>
  );
}
