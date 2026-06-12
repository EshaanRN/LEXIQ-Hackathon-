import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getShopItems } from "@/lib/avatar";

const Input = z.object({ itemId: z.string().min(1).max(100) });

export const purchaseShopItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const item = getShopItems().find((i) => i.id === data.itemId);
    if (!item) return { ok: false as const, reason: "Unknown item" };

    const { data: profile, error: readErr } = await supabaseAdmin
      .from("profiles")
      .select("coins, level, owned_items")
      .eq("id", userId)
      .single();
    if (readErr || !profile) return { ok: false as const, reason: "Profile not found" };

    const owned: string[] = profile.owned_items ?? [];
    if (owned.includes(item.id)) return { ok: false as const, reason: "Already owned" };
    if ((profile.level ?? 1) < item.level) return { ok: false as const, reason: `Reach level ${item.level} first` };
    if ((profile.coins ?? 0) < item.cost) return { ok: false as const, reason: "Not enough coins" };

    const newCoins = profile.coins - item.cost;
    const newOwned = [...owned, item.id];

    const { data: updated, error: updErr } = await supabaseAdmin
      .from("profiles")
      .update({ coins: newCoins, owned_items: newOwned })
      .eq("id", userId)
      .gte("coins", item.cost)
      .select("coins, owned_items")
      .single();

    if (updErr || !updated) return { ok: false as const, reason: "Purchase failed" };

    return { ok: true as const, coins: updated.coins, ownedItems: updated.owned_items as string[] };
  });

