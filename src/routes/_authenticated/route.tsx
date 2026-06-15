import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { AnimatedOutlet } from "@/components/AnimatedOutlet";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/welcome" });
    }
    return { user: data.user };
  },
  component: AuthedShell,
});

function AuthedShell() {
  const router = useRouter();

  useEffect(() => {
    const tabRoutes = ["/app", "/checkpoint", "/dashboard", "/avatar", "/shop"] as const;
    void Promise.all(tabRoutes.map((to) => router.preloadRoute({ to })));
  }, [router]);

  return (
    <div className="min-h-screen">
      <AnimatedOutlet />
      <BottomNav />
    </div>
  );
}
