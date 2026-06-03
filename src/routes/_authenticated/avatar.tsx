import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { BottomNav } from "@/components/BottomNav";
import { XPToast } from "@/components/XPToast";
import { equipItem, useGame } from "@/lib/game-store";
import { AVATAR_ITEMS, SLOTS, type AvatarSlot } from "@/lib/avatar";

export const Route = createFileRoute("/_authenticated/avatar")({
  ssr: false,
  component: AvatarPage,
});

function AvatarPage() {
  const g = useGame();
  const [slot, setSlot] = useState<AvatarSlot>("hair");
  const owned = AVATAR_ITEMS.filter((i) => i.slot === slot && g.ownedItems.includes(i.id));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <Link to="/app" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Your Avatar</h1>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <Avatar equipped={g.avatar} size={160} />
        <p className="mt-3 font-display text-lg font-bold">{g.username ?? "Player"}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{g.rank}</p>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SLOTS.map((s) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest ring-1 ${
              slot === s
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-surface-2 text-muted-foreground ring-border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {owned.map((it) => {
          const active = g.avatar[slot] === it.id;
          return (
            <button
              key={it.id}
              onClick={() => equipItem(slot, it.id)}
              className={`relative flex h-20 flex-col items-center justify-center gap-1 rounded-2xl ring-1 ${
                active ? "ring-primary bg-primary/15" : "ring-border bg-surface-2"
              }`}
              style={
                slot === "skin" || slot === "clothing" || slot === "background"
                  ? { background: it.visual }
                  : undefined
              }
            >
              {(slot === "hair" || slot === "eyes" || slot === "face" || slot === "accessory") && (
                <span className="text-3xl">{it.visual || "—"}</span>
              )}
              <span className="text-[9px] uppercase tracking-widest opacity-80">{it.name}</span>
            </button>
          );
        })}
        {owned.length === 0 && (
          <p className="col-span-4 py-6 text-center text-sm text-muted-foreground">
            No items yet for this slot. Visit the Shop to unlock more.
          </p>
        )}
      </div>

      <Link
        to="/shop"
        className="mt-6 block w-full rounded-full bg-primary py-3 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
      >
        Open Shop
      </Link>

      <BottomNav />
      <XPToast />
    </main>
  );
}
