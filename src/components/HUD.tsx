import { Flame, Coins, Zap } from "lucide-react";
import { useGame, levelForXp, useMounted } from "@/lib/game-store";

export function HUD() {
  const mounted = useMounted();
  const g = useGame();
  if (!mounted) return <div className="h-[68px]" />;
  const { level, intoLevel, nextLevel } = levelForXp(g.xp);
  const pct = Math.min(100, (intoLevel / nextLevel) * 100);

  return (
    <header className="flex items-center gap-3 px-5 pt-5">
      <div className="flex items-center gap-2 rounded-full bg-surface px-3 py-2 ring-1 ring-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold text-sm">
          {level}
        </div>
        <div className="min-w-[80px]">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Lv {level}</span>
            <span>{intoLevel}/{nextLevel}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <Pill icon={<Flame className="h-4 w-4 text-danger" />} value={g.streak} label="streak" />
      <Pill icon={<Coins className="h-4 w-4 text-gold" />} value={g.coins} label="coins" />
      <Pill icon={<Zap className="h-4 w-4 text-primary" />} value={g.xp} label="xp" />
    </header>
  );
}

function Pill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 ring-1 ring-border" title={label}>
      {icon}
      <span className="font-display text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}

export function RankBar() {
  const g = useGame();
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <div className="mx-5 mt-2 flex items-center justify-between rounded-full bg-surface/60 px-4 py-2 text-xs ring-1 ring-border backdrop-blur">
      <span className="uppercase tracking-widest text-muted-foreground">Current Rank</span>
      <span className="font-display font-bold text-gradient-primary">{g.rank}</span>
    </div>
  );
}
