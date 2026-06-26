import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ code: z.string().min(3).max(16) });

type ClaimResult = {
  ok: boolean;
  reason?: string;
  granted?: "none" | "month" | "year";
  count?: number;
  referrer?: string;
};

export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => Input.parse(i))
  .handler(async ({ data, context }): Promise<ClaimResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin.rpc("claim_referral_for", {
      p_user: context.userId,
      p_code: data.code.toUpperCase().trim(),
    });
    if (error) throw new Error(error.message);
    return (res ?? { ok: false }) as ClaimResult;
  });

export const getMyReferral = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("referral_code, referral_count, referral_month_granted, referral_year_granted")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      code: (data?.referral_code as string | null) ?? null,
      count: (data?.referral_count as number | null) ?? 0,
      monthGranted: !!data?.referral_month_granted,
      yearGranted: !!data?.referral_year_granted,
    };
  });
