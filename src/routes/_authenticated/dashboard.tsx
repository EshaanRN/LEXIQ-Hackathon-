import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Coins, Zap, Flame, Trophy, Target, BookOpen, Mic } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ReferralCard } from "@/components/ReferralCard";
import { levelForXp, useGame } from "@/lib/game-store";
import { VOCAB } from "@/data/vocab";


export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const g = useGame();

  const stats = useMemo(() => {
    const ws = Object.values(g.words);
    const learned = ws.filter((w) => w.mastery !== "unknown").length;
    const mastered = ws.filter((w) => w.mastery === "mastered").length;
    const satTotal = VOCAB.filter((w) => w.exam === "sat" || w.exam === "both").length;
    const actTotal = VOCAB.filter((w) => w.exam === "act" || w.exam === "both").length;
    const satMastered = VOCAB.filter((w) => (w.exam === "sat" || w.exam === "both") && g.words[w.id]?.mastery === "mastered").length;
    const actMastered = VOCAB.filter((w) => (w.exam === "act" || w.exam === "both") && g.words[w.id]?.mastery === "mastered").length;
    const rootsMastered = g.rootBonusGiven.length;
    const pronunciationScores = ws.map((w) => w.masteryScore).filter((s): s is number => typeof s === "number");
    const pronAvg = pronunciationScores.length ? Math.round(pronunciationScores.reduce((a, b) => a + b, 0) / pronunciationScores.length) : 0;
    return { learned, mastered, satTotal, actTotal, satMastered, actMastered, rootsMastered, pronAvg };
  }, [g.words, g.rootBonusGiven]);

  const lvl = levelForXp(g.xp);
  const pct = Math.round((lvl.intoLevel / lvl.nextLevel) * 100);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app" aria-label="Back to app" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Progress</h1>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-3xl bg-card p-4 ring-1 ring-border">
        <Avatar equipped={g.avatar} size={72} />
        <div className="flex-1 min-w-0">
          <p className="truncate font-display text-lg font-bold">{g.username ?? "Player"}</p>
          <p className="text-xs uppercase tracking-widest text-gradient-primary font-bold">{g.rank}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Lv {g.level} · {lvl.intoLevel}/{lvl.nextLevel} XP</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat icon={<Zap className="h-4 w-4 text-primary" />} label="XP" value={g.xp} />
        <Stat icon={<Coins className="h-4 w-4 text-gold" />} label="Coins" value={g.coins} />
        <Stat icon={<Flame className="h-4 w-4 text-danger" />} label="Streak" value={g.streak} />
      </div>

      <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Vocabulary</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat icon={<BookOpen className="h-4 w-4 text-primary" />} label="Learned" value={stats.learned} />
        <Stat icon={<Trophy className="h-4 w-4 text-gold" />} label="Mastered" value={stats.mastered} />
      </div>

      <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Exam Coverage</h2>
      <div className="mt-2 space-y-2">
        <CoverageBar label="SAT" value={stats.satMastered} max={stats.satTotal} />
        <CoverageBar label="ACT" value={stats.actMastered} max={stats.actTotal} />
      </div>

      <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Mastery Testing</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat icon={<Target className="h-4 w-4 text-accent" />} label="Checkpoints" value={g.checkpointsPassed} />
        <Stat icon={<Trophy className="h-4 w-4 text-gold" />} label="Perfect" value={g.perfectCheckpoints} />
        <Stat icon={<Mic className="h-4 w-4 text-primary" />} label="Avg Score" value={`${stats.pronAvg}%`} />
        <Stat icon={<BookOpen className="h-4 w-4 text-accent" />} label="Roots Mastered" value={stats.rootsMastered} />
      </div>

      <Link to="/checkpoint"
        className="mt-6 block w-full rounded-full bg-primary py-3 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary">
        Take a Checkpoint
      </Link>




    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{icon}{label}</div>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function CoverageBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
      <div className="flex items-center justify-between text-xs">
        <span className="font-display font-bold">{label}</span>
        <span className="text-muted-foreground">{value} / {max} ({pct}%)</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
