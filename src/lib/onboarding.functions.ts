import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  BACKGROUND_PALETTES,
  DICEBEAR_STYLES,
  defaultAvatar,
  defaultOwned,
  type AvatarConfig,
} from "@/lib/avatar";

const Input = z.object({
  username: z.string().min(1).max(40),
  avatar: z.record(z.string(), z.unknown()),
  interests: z.array(z.string().min(1).max(60)).max(40),
  startingRank: z.string().min(1).max(60),
  exam: z.enum(["sat", "act", "both"]),
});

const FREE_STYLE_IDS = new Set(DICEBEAR_STYLES.filter((style) => style.free).map((style) => style.id));
const FREE_BACKGROUND_KEYS = new Set(BACKGROUND_PALETTES.filter((background) => background.cost === 0).map((background) => background.colors.join(",")));

function sanitizeOnboardingAvatar(rawAvatar: Record<string, unknown>): AvatarConfig {
  const fallback = defaultAvatar();
  const style = typeof rawAvatar.style === "string" && FREE_STYLE_IDS.has(rawAvatar.style)
    ? rawAvatar.style
    : fallback.style;
  const seed = typeof rawAvatar.seed === "string" && rawAvatar.seed.trim().length >= 1 && rawAvatar.seed.length <= 120
    ? rawAvatar.seed
    : fallback.seed;
  const rawBackground = Array.isArray(rawAvatar.backgroundColor)
    ? rawAvatar.backgroundColor.filter((value): value is string => typeof value === "string")
    : [];
  const backgroundKey = rawBackground.join(",");
  const backgroundColor = rawBackground.length >= 2 && FREE_BACKGROUND_KEYS.has(backgroundKey)
    ? rawBackground
    : fallback.backgroundColor;

  return {
    style,
    seed,
    backgroundColor,
    radius: fallback.radius,
  };
}

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const safeAvatar = sanitizeOnboardingAvatar(data.avatar);
    const starterItems = defaultOwned();
    // owned_items is server-authoritative (REVOKEd from authenticated),
    // so onboarding completion must run as admin.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        username: data.username,
        avatar: safeAvatar as never,
        equipped: safeAvatar as never,
        owned_items: starterItems,
        interests: data.interests,
        starting_rank: data.startingRank,
        exam: data.exam,
        onboarding_complete: true,
      })
      .eq("id", userId)
      .eq("onboarding_complete", false)
      .select("id")
      .single();
    if (error) throw error;
    if (!updatedProfile) {
      throw new Error("Onboarding has already been completed.");
    }
    return { ok: true as const };
  });
