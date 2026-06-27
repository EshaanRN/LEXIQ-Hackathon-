import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SyncProgressInput = z.object({
  avatar: z.record(z.string(), z.unknown()).optional(),
  exam: z.enum(["sat", "act", "both"]).optional(),
  checkpointInterval: z.number().int().min(5).max(100).optional(),
  dailyGoal: z.number().int().min(1).max(200).optional(),
  masteryScores: z.record(z.string(), z.number().min(0).max(100)).optional(),
  clientState: z.record(z.string(), z.unknown()).optional(),
});

export const syncClientProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SyncProgressInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const update: Record<string, unknown> = {};
    if (data.avatar) {
      update.avatar = data.avatar;
      update.equipped = data.avatar;
    }
    if (data.exam) update.exam = data.exam;
    if (data.checkpointInterval) update.checkpoint_interval = data.checkpointInterval;
    if (data.dailyGoal) update.daily_goal = data.dailyGoal;
    if (data.masteryScores) update.mastery_scores = data.masteryScores;
    if (data.clientState) update.client_state = data.clientState;

    if (Object.keys(update).length === 0) return { ok: true as const };

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(update as never)
      .eq("id", context.userId);

    if (error) throw new Error(error.message);
    return { ok: true as const };
  });