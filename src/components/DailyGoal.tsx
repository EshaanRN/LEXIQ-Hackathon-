import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Pencil, Minus, Plus, X, Check } from "lucide-react";
import { useGame, useMounted, setDailyGoal, dailyGoalProgress } from "@/lib/game-store";

const PRESETS = [10, 15, 20, 30, 50];

export function DailyGoal() {
  const mounted = useMounted();
  useGame(); // subscribe so progress refreshes
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(15);

  if (!mounted) return null;

  const { learned, goal, reached } = dailyGoalProgress();
  const pct = Math.min(100, (learned / Math.max(1, goal)) * 100);

  function openEditor() {
    setDraft(goal);
    setOpen(true);
  }
  function save() {
    setDailyGoal(draft);
    setOpen(false);
  }
  function bump(delta: number) {
    setDraft((n) => Math.max(1, Math.min(200, n + delta)));
  }

  return (
    <>
      <div className="mx-5 mt-2 rounded-2xl bg-surface/60 px-4 py-2.5 ring-1 ring-border backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Target className="h-3.5 w-3.5 text-accent" /> Daily Goal
          </span>
          <button
            onClick={openEditor}
            className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold tabular-nums ring-1 ring-border transition hover:bg-primary/15 hover:text-primary hover:ring-primary/40"
            aria-label="Edit daily goal"
          >
            <span className={reached ? "text-success" : "text-foreground"}>
              {learned}/{goal}
            </span>
            <Pencil className="h-3 w-3 opacity-60" />
          </button>
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

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6"
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted-foreground ring-1 ring-border transition hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-accent">
                <Target className="h-3.5 w-3.5" /> Daily Goal
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-gradient-primary">
                How many words a day?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                We'll cheer you on when you hit it — and you can keep going for bonus XP.
              </p>

              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  onClick={() => bump(-5)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 ring-1 ring-border transition active:scale-95 hover:bg-primary/15 hover:text-primary"
                  aria-label="Decrease by 5"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="grid place-items-center rounded-2xl bg-surface-2 px-6 py-3 ring-1 ring-border min-w-[120px]">
                  <span className="font-display text-5xl font-bold tabular-nums text-gradient-primary">
                    {draft}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    words / day
                  </span>
                </div>
                <button
                  onClick={() => bump(5)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 ring-1 ring-border transition active:scale-95 hover:bg-primary/15 hover:text-primary"
                  aria-label="Increase by 5"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Quick picks
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESETS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setDraft(n)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition active:scale-95 ${
                        draft === n
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-surface-2 ring-border hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={save}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
              >
                <Check className="h-4 w-4" /> Save Goal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
