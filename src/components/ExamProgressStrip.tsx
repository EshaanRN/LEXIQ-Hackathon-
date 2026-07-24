import { useGame, examProgressBreakdown } from "@/lib/game-store";
import { EXAM_META } from "@/data/vocab-all";

/**
 * Per-exam progress strip. Renders one compact bar per exam in the user's
 * selection so they can see how far they are on each subject at a glance.
 * Hidden entirely when the user only tracks a single exam (the top HUD
 * already reflects that case).
 */
export function ExamProgressStrip() {
  const g = useGame();
  if (g.selectedExams.length < 2) return null;
  const rows = examProgressBreakdown();

  return (
    <div className="mx-5 mt-2 rounded-2xl border border-border bg-surface-2/50 p-2">
      <p className="px-1 pb-1 text-[9px] uppercase tracking-widest text-muted-foreground">
        Progress by exam
      </p>
      <div className="grid gap-1.5">
        {rows.map(({ exam, learned, total }) => {
          const pct = total === 0 ? 0 : Math.min(100, Math.round((learned / total) * 100));
          const isPrimary = exam === g.exam;
          return (
            <div key={exam} className="flex items-center gap-2">
              <span
                className={`w-14 shrink-0 text-[10px] font-bold uppercase tracking-widest ${
                  isPrimary ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {EXAM_META[exam].short}
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    isPrimary ? "bg-gradient-to-r from-primary to-accent" : "bg-primary/50"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                {learned}/{total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
