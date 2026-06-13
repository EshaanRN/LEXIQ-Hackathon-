import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  username: z.string().min(1).max(40),
  avatar: z.record(z.string(), z.unknown()),
  ownedItems: z.array(z.string().min(1).max(80)).max(200),
  interests: z.array(z.string().min(1).max(60)).max(40),
  startingRank: z.string().min(1).max(60),
  exam: z.enum(["sat", "act", "both"]),
});

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // owned_items is server-authoritative (REVOKEd from authenticated),
    // so onboarding completion must run as admin.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        username: data.username,
        avatar: data.avatar as never,
        equipped: data.avatar as never,
        owned_items: data.ownedItems,
        interests: data.interests,
        starting_rank: data.startingRank,
        exam: data.exam,
        onboarding_complete: true,
      })
      .eq("id", userId);
    if (error) throw error;
    return { ok: true as const };
  });
