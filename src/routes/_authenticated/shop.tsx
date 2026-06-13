import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Coins, Lock, Check } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { XPToast } from "@/components/XPToast";
import { Avatar } from "@/components/Avatar";
import { purchaseItem, setAvatar, useGame } from "@/lib/game-store";
import { getShopItems, type ShopItem } from "@/lib/avatar";

export const Route = createFileRoute("/_authenticated/shop")({
  ssr: false,
  component: Shop,
});

const rarityRing: Record<string, string> = {
  common: "ring-muted-foreground/30",
  rare: "ring-accent/60",
  epic: "ring-primary/70",
  legendary: "ring-gold/80 shadow-[0_0_20px_-4px_var(--color-gold)]",
};

function Shop() {
  const g = useGame();
  const [filter, setFilter] = useState<"all" | "style" | "background" | "preset">("all");
  const items = getShopItems().filter((i) => filter === "all" || i.kind === filter);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app" aria-label="Back to app" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Shop</h1>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm ring-1 ring-border">
          <Coins className="h-4 w-4 text-gold" />
          <span className="font-display font-bold tabular-nums">{g.coins}</span>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(["all", "style", "background", "preset"] as const).map((f) => (
          <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it) => {
          const owned = g.ownedItems.includes(it.id);
          const locked = g.level < it.level;
          const canBuy = !owned && !locked && g.coins >= it.cost;
          const ring = rarityRing[it.rarity ?? "common"];
          return (
            <div key={it.id} className={`flex flex-col items-stretch overflow-hidden rounded-2xl bg-card ring-1 ${ring}`}>
              <ItemPreview item={it} />
              <div className="p-3">
                <p className="font-display text-sm font-bold">{it.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{it.kind} · {it.rarity ?? "common"}</p>
                {owned ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                      <Check className="h-3 w-3" /> Owned
                    </div>
                    {(it.kind === "preset") && (
                      <button onClick={() => setAvatar({ style: it.style, seed: it.seed, backgroundColor: it.backgroundColor, radius: 50 })}
                        className="rounded-full bg-primary/20 px-2 py-1 text-[10px] font-bold uppercase text-primary">Equip</button>
                    )}
                  </div>
                ) : locked ? (
                  <div className="mt-2 flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-muted-foreground ring-1 ring-border">
                    <Lock className="h-3 w-3" /> Lv {it.level}
                  </div>
                ) : (
                  <button disabled={!canBuy}
                    onClick={async () => { const r = await purchaseItem(it.id, it.level, it.cost); if (!r.ok && r.reason) alert(r.reason); }}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-40">
                    <Coins className="h-3 w-3" /> {it.cost}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
      <XPToast />
    </main>
  );
}

function ItemPreview({ item }: { item: ShopItem }) {
  if (item.kind === "background") {
    return (
      <div className="h-24" style={{ background: `linear-gradient(135deg, ${item.colors.map((c) => "#" + c).join(",")})` }} />
    );
  }
  if (item.kind === "style") {
    return (
      <div className="grid h-24 place-items-center bg-surface-2">
        <Avatar equipped={{ style: item.styleId, seed: "preview-" + item.id, backgroundColor: ["b6e3f4", "c0aede"] }} size={72} />
      </div>
    );
  }
  // preset
  return (
    <div className="grid h-24 place-items-center" style={{ background: `linear-gradient(135deg, ${item.backgroundColor.map((c) => "#" + c).join(",")})` }}>
      <Avatar equipped={{ style: item.style, seed: item.seed, backgroundColor: item.backgroundColor }} size={72} />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest ring-1 ${active ? "bg-primary text-primary-foreground ring-primary" : "bg-surface-2 text-muted-foreground ring-border"}`}>
      {label}
    </button>
  );
}
