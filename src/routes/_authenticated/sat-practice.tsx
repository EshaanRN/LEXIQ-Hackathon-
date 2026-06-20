import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Crown, Loader2, Sparkles, CheckCircle2, XCircle, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { usePremium } from "@/lib/premium";
import { generateAdaptiveSatQuestions } from "@/lib/practice.functions";
import { getStruggleWords, useGame } from "@/lib/game-store";

export const Route = createFileRoute("/_authenticated/sat-practice")({
  ssr: false,
  component: SatPracticePage,
});

interface Question {
  word: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

function SatPracticePage() {
  const { isPremium, loading } = usePremium();
  const g = useGame();
  const make = useServerFn(generateAdaptiveSatQuestions);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [struggleCount, setStruggleCount] = useState(0);

  useEffect(() => {
    setStruggleCount(getStruggleWords(20).length);
  }, [g.words]);

  if (!loading && !isPremium) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 text-center">
        <Crown className="h-12 w-12 text-gold" />
        <h1 className="mt-3 font-display text-2xl font-bold text-gradient-primary">Adaptive SAT Practice</h1>
        <p className="mt-2 text-sm text-muted-foreground">AI builds SAT questions from the words you struggle with most.</p>
        <Link to="/premium" className="mt-5 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary">
          Unlock Premium
        </Link>
      </main>
    );
  }

  async function build() {
    const struggle = getStruggleWords(15);
    if (struggle.length === 0) {
      setError("No struggle words yet. Swipe a few words first or finish a checkpoint to surface gaps.");
      return;
    }
    setBusy(true); setError(null);
    try {
      const out = await make({ data: {
        struggleWords: struggle.map((w) => ({ word: w.word, definition: w.studentDefinition })),
        count: Math.min(struggle.length, 8),
      }});
      setQuestions(out.questions);
      setIdx(0); setAnswers([]); setPicked(null);
    } catch (e) {
      console.error(e);
      setError("Couldn't generate questions. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function answer(i: number) { if (picked === null) setPicked(i); }
  function next() {
    if (picked === null || !questions) return;
    setAnswers((a) => [...a, picked]);
    setPicked(null);
    setIdx((i) => i + 1);
  }

  const summary = questions && idx >= questions.length;
  const correctCount = questions ? answers.filter((a, i) => a === questions[i]?.correctIndex).length : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/premium" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">SAT Practice</h1>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold ring-1 ring-gold/40">
          <Crown className="h-3 w-3" /> Premium
        </span>
      </div>

      {!questions && (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-6 w-6 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Struggle words found</p>
                <p className="font-display text-2xl font-bold">{struggleCount}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Adaptive SAT questions are built around the words you've gotten wrong or scored low on in checkpoints.
            </p>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            onClick={build}
            disabled={busy || struggleCount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Generating SAT questions…" : "Generate SAT Practice"}
          </button>
        </div>
      )}

      {questions && !summary && (
        <div className="mt-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Question {idx + 1} of {questions.length}</p>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-primary">SAT-style passage</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{questions[idx].prompt}</p>
            <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">Target: <span className="text-foreground">{questions[idx].word}</span></p>
          </div>
          <div className="space-y-2">
            {questions[idx].choices.map((c, i) => {
              const isCorrect = picked !== null && i === questions[idx].correctIndex;
              const isWrongPick = picked === i && picked !== questions[idx].correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={picked !== null}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    isCorrect ? "border-success bg-success/10"
                    : isWrongPick ? "border-danger bg-danger/10"
                    : picked === i ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2 hover:border-primary/50"
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-3 text-[10px] font-bold">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{c}</span>
                  {isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {isWrongPick && <XCircle className="h-4 w-4 text-danger" />}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="rounded-2xl bg-card p-3 text-sm ring-1 ring-border">
              <p className="text-[10px] uppercase tracking-widest text-primary">Why</p>
              <p>{questions[idx].explanation}</p>
            </div>
          )}
          <button
            onClick={next}
            disabled={picked === null}
            className="w-full rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-50"
          >
            {idx + 1 >= questions.length ? "See Results" : "Next"}
          </button>
        </div>
      )}

      {summary && questions && (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">Score</p>
            <h2 className="font-display text-5xl font-bold text-gradient-primary">{correctCount}/{questions.length}</h2>
            <p className="mt-2 text-xs text-muted-foreground">Keep targeting weak words — next round adapts again.</p>
          </div>
          <button
            onClick={() => { setQuestions(null); setAnswers([]); setIdx(0); }}
            className="w-full rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
          >
            New Round
          </button>
        </div>
      )}
    </main>
  );
}
