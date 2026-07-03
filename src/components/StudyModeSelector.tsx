import { useGame, setExam } from "@/lib/game-store";
import type { ExamType } from "@/data/vocab";
import { GraduationCap } from "lucide-react";

interface Props {
  onChange?: (exam: ExamType) => void;
}

const OPTIONS: { value: ExamType; label: string; sub: string }[] = [
  { value: "sat", label: "SAT", sub: "SAT only" },
  { value: "both", label: "SAT · ACT", sub: "Mixed" },
  { value: "act", label: "ACT", sub: "ACT only" },
];

/**
 * Compact 3-way toggle for filtering the swipe feed by exam.
 *  - "SAT"        → SAT-only words
 *  - "SAT · ACT"  → both pools mixed
 *  - "ACT"        → ACT-only words (including words tagged for both)
 *
 * Choice is persisted through game-store → server profile, so it follows the
 * user across devices.
 */
export function StudyModeSelector({ onChange }: Props) {
  const g = useGame();
  const active = g.exam;

  function pick(next: ExamType) {
    if (next === active) return;
    setExam(next);
    onChange?.(next);
  }

  return (
    <div className="mx-5 mt-2">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2/60 p-1.5">
        <span className="hidden sm:inline-flex items-center gap-1 pl-2 pr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <GraduationCap className="h-3 w-3" /> Study
        </span>
        <div className="flex flex-1 gap-1">
          {OPTIONS.map((o) => {
            const isActive = o.value === active;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => pick(o.value)}
                aria-pressed={isActive}
                className={`flex-1 rounded-xl px-2 py-1.5 text-center transition ${
                  isActive
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                <span className="block text-[11px] font-bold tracking-wider">{o.label}</span>
                <span className={`block text-[9px] uppercase tracking-widest ${isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
                  {o.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
