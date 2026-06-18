import { useState } from "react";
import { Target, Pencil, Check } from "lucide-react";
import { useGame, useMounted, setDailyGoal, dailyGoalProgress } from "@/lib/game-store";

export function DailyGoal() {
  const mounted = useMounted();
  useGame(); // subscribe so progress refreshes
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!mounted) return null;

  const { learned, goal, reached } = dailyGoalProgress();
  const pct = Math.min(100, (learned / Math.max(1, goal)) * 100);

  function startEdit() {
    setDraft(String(goal));
    setEditing(true);
  }
  function save() {
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) setDailyGoal(n);
    setEditing(false);
  }

  return (
    <div className="mx-5 mt-2 rounded-2xl bg-surface/60 px-4 py-2.5 ring-1 ring-border backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Target className="h-3.5 w-3.5 text-accent" /> Daily Goal
        </span>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={200}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
              className="w-14 rounded-md bg-surface-2 px-2 py-0.5 text-right text-xs ring-1 ring-border focus:outline-none focus:ring-primary"
            />
            <button
              onClick={save}
              className="rounded-md bg-primary p-1 text-primary-foreground"
              aria-label="Save goal"
            >
              <Check className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 text-xs font-bold tabular-nums text-foreground hover:text-primary"
          >
            <span className={reached ? "text-success" : ""}>
              {learned}/{goal}
            </span>
            <Pencil className="h-3 w-3 opacity-60" />
          </button>
        )}
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            reached ? "bg-success" : "bg-gradient-to-r from-accent to-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {reached && (
        <p className="mt-1 text-[10px] uppercase tracking-widest text-success">
          Goal reached — keep going for bonus XP!
        </p>
      )}
    </div>
  );
}
