import { Flame, Coins, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useGame, levelForXp, useMounted } from "@/lib/game-store";
import { Avatar } from "@/components/Avatar";

export function HUD() {
  const mounted = useMounted();
  const g = useGame();
  if (!mounted) return <div className="h-[80px]" />;
  const { intoLevel, nextLevel } = levelForXp(g.xp);
  const pct = Math.min(100, (intoLevel / nextLevel) * 100);

  return (
    <header className="flex items-center gap-3 px-5 pt-5">
      <Link to="/avatar" className="relative">
        <Avatar equipped={g.avatar} size={52} />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-1.5 py-0.5 font-display text-[10px] font-bold text-primary-foreground ring-2 ring-background">
          {g.level}
        </span>
      </Link>

      <div className="flex-1">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="truncate">{g.username ?? "Player"}</span>
          <span>{intoLevel}/{nextLevel} XP</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-danger">
            <Flame className="h-3.5 w-3.5" />
            <span className="font-bold tabular-nums">{g.streak}</span>
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Coins className="h-3.5 w-3.5" />
            <span className="font-bold tabular-nums">{g.coins}</span>
          </span>
          <span className="flex items-center gap-1 text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span className="font-bold tabular-nums">{g.xp}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

export function RankBar() {
  const g = useGame();
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <div className="mx-5 mt-3 flex items-center justify-between rounded-full bg-surface/60 px-4 py-2 text-xs ring-1 ring-border backdrop-blur">
      <span className="uppercase tracking-widest text-muted-foreground">Rank</span>
      <span className="font-display font-bold text-gradient-primary">{g.rank}</span>
    </div>
  );
}
