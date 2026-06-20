import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, Loader2, Plus, Sparkles, X, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { usePremium } from "@/lib/premium";
import { generateCustomQuiz } from "@/lib/practice.functions";

export const Route = createFileRoute("/_authenticated/custom-test")({
  ssr: false,
  component: CustomTestPage,
});

interface Question {
  word: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

function CustomTestPage() {
  const { isPremium, loading } = usePremium();
  const navigate = useNavigate();
  const make = useServerFn(generateCustomQuiz);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  if (!loading && !isPremium) {
    return <PremiumGate title="Custom Tests" />;
  }

  const words = Array.from(new Set(input.split(/[\n,;]/).map((w) => w.trim()).filter(Boolean)));

  async function build() {
    if (words.length === 0) return;
    setBusy(true); setError(null);
    try {
      const out = await make({ data: { words, count: Math.min(words.length, 10) } });
      setQuestions(out.questions);
      setIdx(0); setAnswers([]); setPicked(null);
    } catch (e) {
      console.error(e);
      setError("Couldn't build the quiz. Try fewer words or try again.");
    } finally {
      setBusy(false);
    }
  }

  function answer(i: number) {
    if (picked !== null) return;
    setPicked(i);
  }
  function next() {
    if (picked === null || !questions) return;
    const nextAnswers = [...answers, picked];
    setAnswers(nextAnswers);
    setPicked(null);
    if (idx + 1 >= questions.length) {
      // finished — keep questions but flip to summary by setting idx out of range
      setIdx(questions.length);
    } else {
      setIdx(idx + 1);
    }
  }

  const summary = questions && idx >= questions.length;
  const correctCount = questions ? answers.filter((a, i) => a === questions[i]?.correctIndex).length : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/premium" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Custom Test</h1>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold ring-1 ring-gold/40">
          <Crown className="h-3 w-3" /> Premium
        </span>
      </div>

      {!questions && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your words</p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              placeholder="Paste or type words, separated by commas or new lines.
e.g. ephemeral, ubiquitous, candid, pragmatic"
              className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-xs text-muted-foreground">{words.length} unique word{words.length === 1 ? "" : "s"} · max 25</p>
            {words.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {words.slice(0, 25).map((w) => (
                  <span key={w} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] ring-1 ring-border">{w}</span>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            onClick={build}
            disabled={busy || words.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Building quiz…" : `Generate ${Math.min(words.length || 0, 10)} questions`}
          </button>
        </div>
      )}

      {questions && !summary && (
        <div className="mt-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Question {idx + 1} of {questions.length}</p>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-primary">Target word</p>
            <h2 className="font-display text-3xl font-bold text-gradient-primary">{questions[idx].word}</h2>
            <p className="mt-3 text-sm">{questions[idx].prompt}</p>
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
          </div>
          <button
            onClick={() => { setQuestions(null); setAnswers([]); setIdx(0); }}
            className="w-full rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
          >
            New Test
          </button>
          <button
            onClick={() => navigate({ to: "/premium" })}
            className="w-full rounded-full bg-surface-2 py-3 font-display text-sm font-bold uppercase tracking-widest ring-1 ring-border"
          >
            Back to Premium
          </button>
        </div>
      )}
    </main>
  );
}

function PremiumGate({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 text-center">
      <Crown className="h-12 w-12 text-gold" />
      <h1 className="mt-3 font-display text-2xl font-bold text-gradient-primary">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">This feature is included with Lexiq Premium.</p>
      <Link to="/premium" className="mt-5 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary">
        Unlock Premium
      </Link>
    </main>
  );
}
// silence unused-imports lint when no questions in view
void Plus; void X;
