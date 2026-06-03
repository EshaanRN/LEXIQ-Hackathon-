import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Splash } from "@/components/Splash";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  component: SplashGate,
});

function SplashGate() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"splash" | "done">("splash");

  useEffect(() => {
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.onboarding_complete) {
        navigate({ to: "/app", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
      setStage("done");
    }, 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return stage === "splash" ? <Splash /> : null;
}
