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
  const [showSplash, setShowSplash] = useState(!alreadyShown);

  useEffect(() => {
    let cancelled = false;
    const minDelay = alreadyShown ? 0 : 1100;
    const start = Date.now();

    async function go() {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      let dest = "/auth" as const;
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", data.user.id)
          .maybeSingle();
        if (cancelled) return;
        dest = (profile?.onboarding_complete ? "/app" : "/onboarding") as never;
      }
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minDelay - elapsed);
      setTimeout(() => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(SPLASH_SHOWN_KEY, "1");
        } catch {}
        setShowSplash(false);
        navigate({ to: dest, replace: true });
      }, wait);
    }
    go();
    return () => {
      cancelled = true;
    };
  }, [navigate, alreadyShown]);

  return showSplash ? <Splash /> : null;
}
