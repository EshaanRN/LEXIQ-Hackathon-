import { useGame, setExam } from "@/lib/game-store";
import type { ExamType } from "@/data/vocab";
import { EXAM_ORDER, EXAM_META, examCounts } from "@/data/vocab-all";
import { GraduationCap } from "lucide-react";
import { useMemo } from "react";

interface Props {
  onChange?: (exam: ExamType) => void;
}

/**
 * Horizontal scrollable exam picker. Each pill shows word count for that exam
 * plus a "Mixed" pill that unions every seeded pool. Choice is persisted through
 * game-store → server profile so it follows the user across devices.
 */
export function StudyModeSelector({ onChange }: Props) {
  const g = useGame();
  const active = g.exam;
  const counts = useMemo(() => examCounts(), []);

  function pick(next: ExamType) {
    if (next === active) return;
    setExam(next);
    onChange?.(next);
  }

  return (
    <div className="mx-5 mt-2">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2/60 p-1.5">
        <span className="hidden sm:inline-flex items-center gap-1 pl-2 pr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
          <GraduationCap className="h-3 w-3" /> Exam
        </span>
        <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-none">
          {EXAM_ORDER.map((e) => {
            const isActive = e === active;
            const count = counts[e];
            const disabled = count === 0;
            return (
              <button
                key={e}
                type="button"
                onClick={() => !disabled && pick(e)}
                aria-pressed={isActive}
                disabled={disabled}
                title={disabled ? `${EXAM_META[e].label} coming soon` : `${count} words`}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-center transition ${
                  isActive
                    ? "bg-primary text-primary-foreground glow-primary"
                    : disabled
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                <span className="block text-[11px] font-bold tracking-wider">{EXAM_META[e].short}</span>
                <span
                  className={`block text-[9px] uppercase tracking-widest ${
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"
                  }`}
                >
                  {count > 0 ? `${count} words` : "soon"}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => pick("both")}
            aria-pressed={active === "both"}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-center transition ${
              active === "both"
                ? "bg-primary text-primary-foreground glow-primary"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <span className="block text-[11px] font-bold tracking-wider">Mixed</span>
            <span
              className={`block text-[9px] uppercase tracking-widest ${
                active === "both" ? "text-primary-foreground/80" : "text-muted-foreground/70"
              }`}
            >
              All
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
