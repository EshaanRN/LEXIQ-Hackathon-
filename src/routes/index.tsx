import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  component: SplashGate,
});

const SPLASH_SHOWN_KEY = "lexiq:splash-shown";

type Dest = "/auth" | "/app" | "/onboarding";

/** Wait briefly for a session to appear (covers OAuth redirect handoff). */
async function waitForSession(maxMs = 2000) {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  return new Promise<typeof data.session | null>((resolve) => {
    let done = false;
    const finish = (s: typeof data.session | null) => {
      if (done) return;
      done = true;
      sub.subscription.unsubscribe();
      clearTimeout(t);
      resolve(s);
    };
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(session);
    });
    const t = setTimeout(() => finish(null), maxMs);
  });
}

async function resolveDestination(): Promise<Dest> {
  const session = await waitForSession();
  const user = session?.user;
  if (!user) return "/auth";

  try {
    const profilePromise = supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();
    const result = await Promise.race([
      profilePromise,
      new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 1500),
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
  const [message, setMessage] = useState("Loading Lexiq…");
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const alreadyShown =
      typeof window !== "undefined" &&
      sessionStorage.getItem(SPLASH_SHOWN_KEY) === "1";
    const minDelay = alreadyShown ? 0 : 800;
    const start = Date.now();

    function go(dest: Dest) {
      if (cancelled || navigatedRef.current) return;
      navigatedRef.current = true;
      try {
        sessionStorage.setItem(SPLASH_SHOWN_KEY, "1");
      } catch {}
      navigate({ to: dest, replace: true });
    }

    const hardTimeout = setTimeout(() => {
      if (cancelled || navigatedRef.current) return;
      setStuck(true);
      go("/auth");
    }, 6000);

    const stuckHint = setTimeout(() => {
      if (!cancelled && !navigatedRef.current) setStuck(true);
    }, 3500);

    (async () => {
      let dest: Dest = "/auth";
      try {
        dest = await resolveDestination();
      } catch (e) {
        console.error("[startup] failed", e);
        setMessage("Reconnecting…");
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
      <LoadingScreen message={message} />
      {stuck && (
        <div className="fixed inset-x-0 bottom-10 z-[201] flex justify-center px-4">
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
