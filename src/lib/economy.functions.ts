import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
  .inputValidator((d: { xp?: number; coins?: number; wordsLearnedDelta?: number }) => ({
    xp: Math.max(0, Math.min(100000, Math.floor(d?.xp ?? 0))),
    coins: Math.max(0, Math.min(100000, Math.floor(d?.coins ?? 0))),
    wordsLearnedDelta: Math.max(0, Math.min(1000, Math.floor(d?.wordsLearnedDelta ?? 0))),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // Economy columns are server-authoritative — authenticated role has no
    // UPDATE grant on xp/coins/level/words_learned_total. Use admin client.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .select("xp, coins, words_learned_total")
      .eq("id", userId)
      .single();
    if (error) throw error;

    const newXp = (row?.xp ?? 0) + data.xp;
    const newCoins = (row?.coins ?? 0) + data.coins;
    const newWld = (row?.words_learned_total ?? 0) + data.wordsLearnedDelta;
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

