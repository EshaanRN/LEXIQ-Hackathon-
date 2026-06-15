import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  BACKGROUND_PALETTES,
  PRESET_AVATARS,
  bgOwned,
  defaultAvatar,
  styleOwned,
  type AvatarConfig,
  type DicebearStyleId,
} from "@/lib/avatar";

const CHECKPOINT_INTERVALS = [5, 10, 20, 25, 50, 75, 100] as const;

const UpdateProfilePreferencesInput = z
  .object({
    avatar: z.record(z.string(), z.unknown()).optional(),
    checkpointInterval: z.enum(CHECKPOINT_INTERVALS.map(String) as [string, ...string[]]).transform(Number).optional(),
    exam: z.enum(["sat", "act", "both"]).optional(),
  })
  .refine((value) => value.avatar || value.checkpointInterval !== undefined || value.exam !== undefined, {
    message: "No profile changes provided.",
  });

const VALID_STYLE_IDS = new Set<string>([
  "adventurer",
  "avataaars",
  "big-smile",
  "fun-emoji",
  "lorelei",
  "micah",
  "notionists",
  "personas",
  "pixel-art",
  "bottts",
  "shapes",
]);

function isDicebearStyleId(value: unknown): value is DicebearStyleId {
  return typeof value === "string" && VALID_STYLE_IDS.has(value);
}

function sanitizeEquippedAvatar(rawAvatar: Record<string, unknown>, ownedItems: string[]): AvatarConfig {
  const fallback = defaultAvatar();
  const style = isDicebearStyleId(rawAvatar.style) ? rawAvatar.style : fallback.style;
  const seed = typeof rawAvatar.seed === "string" && rawAvatar.seed.trim().length >= 1 && rawAvatar.seed.length <= 120
    ? rawAvatar.seed.trim()
    : fallback.seed;
  const rawBackground = Array.isArray(rawAvatar.backgroundColor)
    ? rawAvatar.backgroundColor.filter((value): value is string => typeof value === "string")
    : fallback.backgroundColor;
  const palette = BACKGROUND_PALETTES.find((background) => background.colors.join(",") === rawBackground.join(","));
  const ownedPreset = PRESET_AVATARS.find((preset) =>
    ownedItems.includes(preset.id)
    && preset.style === style
    && preset.seed === seed
    && preset.backgroundColor.join(",") === rawBackground.join(","),
  );

  if (ownedPreset) {
    return {
      style: ownedPreset.style,
      seed: ownedPreset.seed,
      backgroundColor: ownedPreset.backgroundColor,
      radius: 50,
    };
  }

  if (palette && styleOwned(ownedItems, style) && bgOwned(ownedItems, palette.id)) {
    return {
      style,
      seed,
      backgroundColor: palette.colors,
      radius: 50,
    };
  }

  return fallback;
}

export const updateProfilePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateProfilePreferencesInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("owned_items, exam, checkpoint_interval, equipped")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw profileError ?? new Error("Profile not found.");
    }

    const nextAvatar = data.avatar
      ? sanitizeEquippedAvatar(data.avatar, profile.owned_items ?? [])
      : (profile.equipped as AvatarConfig | null) ?? defaultAvatar();

    const nextExam = data.exam ?? profile.exam;
    const nextCheckpointInterval = data.checkpointInterval ?? profile.checkpoint_interval;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        avatar: nextAvatar as never,
        equipped: nextAvatar as never,
        exam: nextExam,
        checkpoint_interval: nextCheckpointInterval,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return {
      ok: true as const,
      avatar: nextAvatar,
      exam: nextExam,
      checkpointInterval: nextCheckpointInterval,
    };
  });