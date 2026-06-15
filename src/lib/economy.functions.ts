import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const EconomyInput = z.object({
  learnedWords: z.number().int().min(0).max(20).default(0),
  masteredMissed: z.number().int().min(0).max(20).default(0),
  rootMastered: z.number().int().min(0).max(5).default(0),
  checkpointPassed: z.number().int().min(0).max(1).default(0),
  perfectCheckpoints: z.number().int().min(0).max(1).default(0),
  masteryMilestones10: z.number().int().min(0).max(1).default(0),
  masteryMilestones25: z.number().int().min(0).max(1).default(0),
  masteryMilestones100: z.number().int().min(0).max(1).default(0),
  studyBonuses: z.number().int().min(0).max(2).default(0),
});

function computeEconomyAward(data: z.infer<typeof EconomyInput>) {
  const xp =
    data.learnedWords * 25
    + data.masteredMissed * 50
    + data.rootMastered * 100
    + data.checkpointPassed * 100
    + data.perfectCheckpoints * 250
    + data.studyBonuses * 10;

  const coins =
    data.learnedWords * 5
    + data.masteredMissed * 25
    + data.rootMastered * 50
    + data.checkpointPassed * 25
    + data.perfectCheckpoints * 75
    + data.masteryMilestones10 * 100
    + data.masteryMilestones25 * 250
    + data.masteryMilestones100 * 1000;

  const wordsLearnedDelta = data.learnedWords;

  return { xp, coins, wordsLearnedDelta };
}

function levelForXp(xp: number) {
  let level = 1;
  let need = 100;
  let acc = 0;
  while (xp >= acc + need) {
    acc += need;
    level++;
    need = Math.round(need * 1.15);
  }
  return level;
}

export const awardEconomy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EconomyInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const award = computeEconomyAward(data);
    // Economy columns are server-authoritative — authenticated role has no
    // UPDATE grant on xp/coins/level/words_learned_total. Use admin client.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .select("xp, coins, words_learned_total")
      .eq("id", userId)
      .single();
    if (error) throw error;

    const newXp = (row?.xp ?? 0) + award.xp;
    const newCoins = (row?.coins ?? 0) + award.coins;
    const newWld = (row?.words_learned_total ?? 0) + award.wordsLearnedDelta;
    const prevLevel = levelForXp(row?.xp ?? 0);
    const newLevel = levelForXp(newXp);
    let finalCoins = newCoins;
    if (newLevel > prevLevel) {
      finalCoins += (newLevel - prevLevel) * 100;
    }

    const { error: upErr } = await supabaseAdmin
      .from("profiles")
      .update({
        xp: newXp,
        coins: finalCoins,
        level: newLevel,
        words_learned_total: newWld,
      })
      .eq("id", userId);
    if (upErr) throw upErr;

    return { xp: newXp, coins: finalCoins, level: newLevel, wordsLearnedTotal: newWld };
  });

