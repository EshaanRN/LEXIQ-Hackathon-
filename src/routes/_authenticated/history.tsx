import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, Flag, Volume2, History } from "lucide-react";
import { LearnSheet } from "@/components/LearnSheet";
import { getLearnedWords, toggleReviewFlag, useGame, useMounted } from "@/lib/game-store";
import { speak } from "@/lib/speak";
import type { VocabWord } from "@/data/vocab";

export const Route = createFileRoute("/_authenticated/history")({
  ssr: false,
  component: HistoryPage,
});

type Sort = "recent" | "difficult" | "mastered" | "review";

const SORTS: { id: Sort; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "difficult", label: "Difficult" },
  { id: "mastered", label: "Mastered" },
  { id: "review", label: "Needs review" },
];

const MASTERY_RANK: Record<string, number> = {
  unknown: 0,
  learning: 1,
  practicing: 2,
  familiar: 3,
  mastered: 4,
};

function HistoryPage() {
  const mounted = useMounted();
  useGame(); // subscribe
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [open, setOpen] = useState<VocabWord | null>(null);

  const rows = useMemo(() => {
    if (!mounted) return [];
    const all = getLearnedWords();
    const q = query.trim().toLowerCase();
    const filtered = q
      ? all.filter(
          (r) =>
            r.word.word.toLowerCase().includes(q) ||
            r.word.studentDefinition.toLowerCase().includes(q),
        )
      : all;
    const sorted = [...filtered];
    if (sort === "recent") {
      sorted.sort((a, b) => (b.ws.lastSeenAt ?? 0) - (a.ws.lastSeenAt ?? 0));
    } else if (sort === "difficult") {
      sorted.sort((a, b) => {
        const ra = MASTERY_RANK[a.ws.mastery] + (a.ws.wasMissed ? -0.5 : 0);
        const rb = MASTERY_RANK[b.ws.mastery] + (b.ws.wasMissed ? -0.5 : 0);
        return ra - rb;
      });
    } else if (sort === "mastered") {
      sorted.sort((a, b) => MASTERY_RANK[b.ws.mastery] - MASTERY_RANK[a.ws.mastery]);
    } else if (sort === "review") {
      sorted.sort((a, b) => Number(!!b.ws.reviewFlagged) - Number(!!a.ws.reviewFlagged));
    }
    return sorted;
  }, [mounted, query, sort]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link
          to="/app"
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex items-center gap-2 font-display text-xl font-bold">
          <History className="h-5 w-5 text-primary" /> Word History
        </h1>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full bg-surface-2 px-3 py-2 ring-1 ring-border focus-within:ring-primary/50">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your learned words…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition active:scale-95 ${
              sort === s.id
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-surface-2 ring-border hover:bg-surface-3"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          No learned words yet. Head to the feed and swipe to start your history.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map(({ word, ws }) => (
            <li
              key={word.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border"
            >
              <button
                onClick={() => setOpen(word)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-bold">{word.word}</p>
                  <MasteryPill m={ws.mastery} />
                  {ws.reviewFlagged && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold ring-1 ring-gold/30">
                      Review
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {word.studentDefinition}
                </p>
              </button>
              <button
                onClick={() => speak(word.word)}
                aria-label={`Play ${word.word}`}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-muted-foreground ring-1 ring-border hover:text-primary"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleReviewFlag(word.id)}
                aria-label="Mark for review"
                className={`grid h-9 w-9 place-items-center rounded-full ring-1 transition ${
                  ws.reviewFlagged
                    ? "bg-gold/20 text-gold ring-gold/40"
                    : "bg-surface-2 text-muted-foreground ring-border hover:text-gold"
                }`}
              >
                <Flag className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <LearnSheet word={open} viewOnly onLearned={() => setOpen(null)} onSkip={() => setOpen(null)} />
    </main>
  );
}

function MasteryPill({ m }: { m: string }) {
  const map: Record<string, string> = {
    learning: "bg-danger/15 text-danger ring-danger/30",
    practicing: "bg-gold/15 text-gold ring-gold/30",
    familiar: "bg-primary/15 text-primary ring-primary/30",
    mastered: "bg-success/15 text-success ring-success/30",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ring-1 ${map[m] ?? ""}`}>
      {m}
    </span>
  );
}
