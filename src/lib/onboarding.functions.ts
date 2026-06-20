import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  BACKGROUND_PALETTES,
  DICEBEAR_STYLES,
  defaultAvatar,
  defaultOwned,
  type AvatarConfig,
  type DicebearStyleId,
} from "@/lib/avatar";

const Input = z.object({
  username: z.string().min(1).max(40),
  avatar: z.record(z.string(), z.unknown()),
  interests: z.array(z.string().min(1).max(60)).max(40),
  startingRank: z.string().min(1).max(60),
  exam: z.enum(["sat", "act", "both"]),
});

const FREE_STYLE_IDS = new Set<string>(DICEBEAR_STYLES.filter((style) => style.free).map((style) => style.id));
const FREE_BACKGROUND_KEYS = new Set<string>(BACKGROUND_PALETTES.filter((background) => background.cost === 0).map((background) => background.colors.join(",")));

function isFreeStyleId(value: unknown): value is DicebearStyleId {
  return typeof value === "string" && FREE_STYLE_IDS.has(value);
}

function sanitizeOnboardingAvatar(rawAvatar: Record<string, unknown>): AvatarConfig {
  const fallback = defaultAvatar();
  const style = isFreeStyleId(rawAvatar.style)
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // If this user already finished onboarding, treat as success (idempotent).
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, username, onboarding_complete")
      .eq("id", userId)
      .maybeSingle();
    if (existing?.onboarding_complete) {
      return { ok: true as const, username: existing.username ?? data.username };
    }

    // Resolve a unique username — if taken, append a short suffix and retry.
    const baseUsername = data.username.trim().slice(0, 32) || `Player${Math.floor(Math.random() * 9999)}`;
    let finalUsername = baseUsername;
    let updatedId: string | null = null;
    let lastError: { code?: string; message: string } | null = null;

    for (let attempt = 0; attempt < 6; attempt++) {
      const { data: row, error } = await supabaseAdmin
        .from("profiles")
        .update({
          username: finalUsername,
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
        .maybeSingle();

      if (!error) {
        updatedId = row?.id ?? null;
        break;
      }
      lastError = error;
      if (error.code === "23505") {
        const suffix = Math.floor(Math.random() * 9000) + 1000;
        finalUsername = `${baseUsername.slice(0, 28)}${suffix}`;
        continue;
      }
      throw error;
    }

    if (!updatedId) {
      throw new Error(lastError?.message ?? "Could not complete onboarding.");
    }
    return { ok: true as const, username: finalUsername };
  });
