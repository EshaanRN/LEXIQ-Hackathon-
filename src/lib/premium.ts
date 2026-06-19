import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PremiumStatus {
  isPremium: boolean;
  plan: "monthly" | "annual" | null;
  until: string | null;
  loading: boolean;
}

const LS_KEY = "lexiq:premium";

function readCache(): PremiumStatus {
  if (typeof window === "undefined") {
    return { isPremium: false, plan: null, until: null, loading: true };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { isPremium: false, plan: null, until: null, loading: true };
    const v = JSON.parse(raw);
    const active = !!v.isPremium && (!v.until || new Date(v.until) > new Date());
    return { isPremium: active, plan: v.plan ?? null, until: v.until ?? null, loading: true };
  } catch {
    return { isPremium: false, plan: null, until: null, loading: true };
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
        if (!cancelled) setState({ isPremium: false, plan: null, until: null, loading: false });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, premium_plan, premium_until")
        .eq("id", userRes.user.id)
        .maybeSingle();
      if (cancelled) return;
      const active =
        !!data?.is_premium && (!data.premium_until || new Date(data.premium_until) > new Date());
      const next = {
        isPremium: active,
        plan: (data?.premium_plan as "monthly" | "annual" | null) ?? null,
        until: data?.premium_until ?? null,
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
