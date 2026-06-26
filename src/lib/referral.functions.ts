import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ code: z.string().min(3).max(16) });

export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => Input.parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Use service-role to call RPC, but enforce caller identity via SECURITY DEFINER + auth.uid().
    // We instead invoke as the user to keep auth.uid() correct.
    const { createServerClient } = await import("@/integrations/supabase/client.server");
    const sb = await createServerClient(context.userId);
    const { data: res, error } = await sb.rpc("claim_referral", { p_code: data.code.toUpperCase().trim() });
    if (error) throw new Error(error.message);
    return res as { ok: boolean; reason?: string; granted?: "none" | "month" | "year"; count?: number };
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
      code: data?.referral_code as string | null,
      count: (data?.referral_count as number | null) ?? 0,
      monthGranted: !!data?.referral_month_granted,
      yearGranted: !!data?.referral_year_granted,
    };
  });
