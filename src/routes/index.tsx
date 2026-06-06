import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Splash } from "@/components/Splash";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  component: SplashGate,
});

const SPLASH_SHOWN_KEY = "lexiq:splash-shown";

function SplashGate() {
  const navigate = useNavigate();
  const alreadyShown =
    typeof window !== "undefined" && sessionStorage.getItem(SPLASH_SHOWN_KEY) === "1";
  const [tagline, setTagline] = useState("Swipe. Learn. Level up.");

  useEffect(() => {
    let cancelled = false;
    const minDelay = alreadyShown ? 0 : 1100;
    const start = Date.now();

    async function go() {
      let dest: "/auth" | "/app" | "/onboarding" = "/auth";
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!error && data.user) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("onboarding_complete")
              .eq("id", data.user.id)
              .maybeSingle();
            if (cancelled) return;
            dest = profile?.onboarding_complete ? "/app" : "/onboarding";
          } catch {
            dest = "/onboarding";
          }
        }
      } catch (e) {
        console.error("[startup] auth check failed", e);
        setTagline("Reconnecting…");
      }

      const wait = Math.max(0, minDelay - (Date.now() - start));
      setTimeout(() => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(SPLASH_SHOWN_KEY, "1");
        } catch {}
        navigate({ to: dest, replace: true });
      }, wait);
    }
    go();
    return () => {
      cancelled = true;
    };
  }, [navigate, alreadyShown]);

  // Always render splash — never return null so the user never sees a blank screen.
  return <Splash tagline={tagline} />;
}
