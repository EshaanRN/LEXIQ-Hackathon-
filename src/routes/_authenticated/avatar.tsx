import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { BottomNav } from "@/components/BottomNav";
import { XPToast } from "@/components/XPToast";
import { setAvatar, useGame } from "@/lib/game-store";
import { AvatarBuilder } from "@/routes/_authenticated/onboarding";

export const Route = createFileRoute("/_authenticated/avatar")({
  ssr: false,
  component: AvatarPage,
});

function AvatarPage() {
  const g = useGame();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Your Avatar</h1>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <Avatar equipped={g.avatar} size={140} />
        <p className="mt-3 font-display text-lg font-bold">{g.username ?? "Player"}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{g.rank}</p>
      </div>

      <div className="mt-2">
        <AvatarBuilder avatar={g.avatar} setAvatar={setAvatar} owned={g.ownedItems} />
      </div>

      <Link to="/shop"
        className="mt-6 block w-full rounded-full bg-primary py-3 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary">
        Open Shop
      </Link>

      <BottomNav />
      <XPToast />
    </main>
  );
}
