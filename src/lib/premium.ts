import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";

export type SubStatus = "active" | "trialing" | "past_due" | "paused" | "canceled" | null;

export interface PremiumStatus {
  isPremium: boolean;
  plan: "monthly" | "annual" | null;
  until: string | null;
  status: SubStatus;
  loading: boolean;
}

const LS_KEY = "lexiq:premium";

function readCache(): PremiumStatus {
  if (typeof window === "undefined") {
    return { isPremium: false, plan: null, until: null, status: null, loading: true };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { isPremium: false, plan: null, until: null, status: null, loading: true };
    const v = JSON.parse(raw);
    const active = !!v.isPremium && (!v.until || new Date(v.until) > new Date());
    return {
      isPremium: active,
      plan: v.plan ?? null,
      until: v.until ?? null,
      status: v.status ?? null,
      loading: true,
    };
  } catch {
    return { isPremium: false, plan: null, until: null, status: null, loading: true };
  }
}

function writeCache(s: Omit<PremiumStatus, "loading">) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}

export function usePremium(): PremiumStatus {
  const [state, setState] = useState<PremiumStatus>(() => readCache());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        if (!cancelled)
          setState({ isPremium: false, plan: null, until: null, status: null, loading: false });
        return;
      }
      const [{ data: profile }, { data: sub }] = await Promise.all([
        supabase
          .from("profiles")
          .select("is_premium, premium_plan, premium_until")
          .eq("id", userRes.user.id)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", userRes.user.id)
          .eq("environment", getPaddleEnvironment())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      const active =
        !!profile?.is_premium &&
        (!profile.premium_until || new Date(profile.premium_until) > new Date());
      const next = {
        isPremium: active,
        plan: (profile?.premium_plan as "monthly" | "annual" | null) ?? null,
        until: profile?.premium_until ?? null,
        status: (sub?.status as SubStatus) ?? null,
      };
      writeCache(next);
      setState({ ...next, loading: false });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
