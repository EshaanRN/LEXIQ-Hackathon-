import { useGame, addSelectedExam, removeSelectedExam, setExam } from "@/lib/game-store";
import type { ExamType } from "@/data/vocab";
import { EXAM_ORDER, EXAM_META, examCounts } from "@/data/vocab-all";
import { GraduationCap, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  onChange?: (exam: ExamType) => void;
}

/**
 * Multi-exam selector. Selected exams live at the top as removable chips (and
 * clicking one sets it as the "primary" for variant rendering). A dedicated
 * "Add another exam" row lists any exam the user has not yet picked so they
 * can layer new subjects into the feed. Empty pools (count 0) are hidden.
 */
export function StudyModeSelector({ onChange }: Props) {
  const g = useGame();
  const counts = useMemo(() => examCounts(), []);
  const [addOpen, setAddOpen] = useState(false);

  const selected = g.selectedExams;
  const available = EXAM_ORDER.filter((e) => !selected.includes(e) && counts[e] > 0);

  function pickPrimary(e: Exclude<ExamType, "both">) {
    if (e !== g.exam) {
      setExam(e);
      onChange?.(e);
    }
  }

  function remove(e: Exclude<ExamType, "both">) {
    if (selected.length <= 1) return;
    removeSelectedExam(e);
    onChange?.(g.exam);
  }

  function add(e: Exclude<ExamType, "both">) {
    addSelectedExam(e);
    setAddOpen(false);
    onChange?.(e);
  }

  return (
    <div className="mx-5 mt-2 space-y-2">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2/60 p-1.5">
        <span className="hidden sm:inline-flex items-center gap-1 pl-2 pr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
          <GraduationCap className="h-3 w-3" /> Studying
        </span>
        <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-none">
          {selected.map((e) => {
            const isPrimary = e === g.exam;
            const count = counts[e];
            return (
              <div
                key={e}
                className={`group relative flex shrink-0 items-center gap-1 rounded-xl transition ${
                  isPrimary ? "bg-primary text-primary-foreground glow-primary" : "bg-surface text-foreground hover:bg-surface-3"
                }`}
              >
                <button
                  type="button"
                  onClick={() => pickPrimary(e)}
                  aria-pressed={isPrimary}
                  className="px-3 py-1.5 text-center"
                  title={`${count} words`}
                >
                  <span className="block text-[11px] font-bold tracking-wider">{EXAM_META[e].short}</span>
                  <span
                    className={`block text-[9px] uppercase tracking-widest ${
                      isPrimary ? "text-primary-foreground/80" : "text-muted-foreground/70"
                    }`}
                  >
                    {count} words
                  </span>
                </button>
                {selected.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(e)}
                    aria-label={`Remove ${EXAM_META[e].label}`}
                    className={`mr-1 grid h-5 w-5 place-items-center rounded-full transition ${
                      isPrimary
                        ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                        : "bg-surface-3 text-muted-foreground hover:bg-danger/20 hover:text-danger"
                    }`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
          {available.length > 0 && (
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              aria-expanded={addOpen}
              className="shrink-0 flex items-center gap-1 rounded-xl border border-dashed border-primary/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          )}
        </div>
      </div>

      {addOpen && available.length > 0 && (
        <div className="rounded-2xl border border-primary/40 bg-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Add another exam</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {available.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => add(e)}
                className="flex flex-col items-start gap-0.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-left transition hover:border-primary hover:bg-primary/10"
              >
                <span className="text-xs font-bold tracking-wide">{EXAM_META[e].label}</span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  {counts[e]} words
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
