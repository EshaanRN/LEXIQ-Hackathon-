import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, Loader2, Sparkles, CheckCircle2, XCircle, Search, X, Plus } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { usePremium } from "@/lib/premium";
import { generateCustomQuiz } from "@/lib/practice.functions";
import { VOCAB, type VocabWord } from "@/data/vocab";

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

const MAX_WORDS = 25;

function CustomTestPage() {
  const { isPremium, loading } = usePremium();
  const navigate = useNavigate();
  const make = useServerFn(generateCustomQuiz);

  // Selected words from app vocab
  const [picked, setPicked] = useState<VocabWord[]>([]);
  // Custom typed words not in app
  const [customInput, setCustomInput] = useState("");
  const [customWords, setCustomWords] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [choice, setChoice] = useState<number | null>(null);

  if (!loading && !isPremium) {
    return <PremiumGate title="Custom Tests" />;
  }

  const totalCount = picked.length + customWords.length;

  function addPicked(w: VocabWord) {
    if (picked.some((p) => p.id === w.id)) return;
    if (totalCount >= MAX_WORDS) return;
    setPicked([...picked, w]);
  }
  function removePicked(id: string) {
    setPicked(picked.filter((p) => p.id !== id));
  }
  function addCustom() {
    const parts = customInput
      .split(/[\n,;]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (parts.length === 0) return;
    const existing = new Set([...customWords, ...picked.map((p) => p.word.toLowerCase())]);
    const fresh: string[] = [];
    for (const p of parts) {
      if (!existing.has(p) && customWords.length + fresh.length + picked.length < MAX_WORDS) {
        existing.add(p);
        fresh.push(p);
      }
    }
    setCustomWords([...customWords, ...fresh]);
    setCustomInput("");
  }
  function removeCustom(w: string) {
    setCustomWords(customWords.filter((x) => x !== w));
  }

  async function build() {
    const words = [...picked.map((p) => p.word), ...customWords];
    if (words.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const out = await make({ data: { words, count: Math.min(words.length, 10) } });
      setQuestions(out.questions);
      setIdx(0);
      setAnswers([]);
      setChoice(null);
    } catch (e) {
      console.error(e);
      setError("Couldn't build the quiz. Try fewer words or try again.");
    } finally {
      setBusy(false);
    }
  }

  function answer(i: number) {
    if (choice !== null) return;
    setChoice(i);
  }
  function next() {
    if (choice === null || !questions) return;
    setAnswers([...answers, choice]);
    setChoice(null);
    setIdx(idx + 1 >= questions.length ? questions.length : idx + 1);
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
          {/* Search & pick from vocab */}
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Pick from Lexiq words</p>
            <WordPicker
              onPick={addPicked}
              isPicked={(id) => picked.some((p) => p.id === id)}
              disabled={totalCount >= MAX_WORDS}
            />
            {picked.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {picked.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => removePicked(w.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/40 hover:bg-primary/25"
                  >
                    {w.word} <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom words not in app */}
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Add your own words</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Don't see a word in Lexiq? Add it here and we'll generate SAT-style questions on it too.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="e.g. perspicacious, sanguine"
                className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                onClick={addCustom}
                disabled={!customInput.trim() || totalCount >= MAX_WORDS}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {customWords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {customWords.map((w) => (
                  <button
                    key={w}
                    onClick={() => removeCustom(w)}
                    className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold ring-1 ring-gold/40 hover:bg-gold/25"
                  >
                    {w} <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {totalCount} of {MAX_WORDS} words selected
          </p>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            onClick={build}
            disabled={busy || totalCount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Building quiz…" : `Generate ${Math.min(totalCount || 0, 10)} questions`}
          </button>
        </div>
      )}

      {questions && !summary && (
        <div className="mt-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Question {idx + 1} of {questions.length}
          </p>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-primary">Target word</p>
            <h2 className="font-display text-3xl font-bold text-gradient-primary">{questions[idx].word}</h2>
            <p className="mt-3 text-sm">{questions[idx].prompt}</p>
          </div>
          <div className="space-y-2">
            {questions[idx].choices.map((c, i) => {
              const isCorrect = choice !== null && i === questions[idx].correctIndex;
              const isWrongPick = choice === i && choice !== questions[idx].correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={choice !== null}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    isCorrect
                      ? "border-success bg-success/10"
                      : isWrongPick
                      ? "border-danger bg-danger/10"
                      : choice === i
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-2 hover:border-primary/50"
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-3 text-[10px] font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{c}</span>
                  {isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {isWrongPick && <XCircle className="h-4 w-4 text-danger" />}
                </button>
              );
            })}
          </div>
          {choice !== null && (
            <div className="rounded-2xl bg-card p-3 text-sm ring-1 ring-border">
              <p className="text-[10px] uppercase tracking-widest text-primary">Why</p>
              <p>{questions[idx].explanation}</p>
            </div>
          )}
          <button
            onClick={next}
            disabled={choice === null}
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
            <h2 className="font-display text-5xl font-bold text-gradient-primary">
              {correctCount}/{questions.length}
            </h2>
          </div>
          <button
            onClick={() => {
              setQuestions(null);
              setAnswers([]);
              setIdx(0);
            }}
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

function WordPicker({
  onPick,
  isPicked,
  disabled,
}: {
  onPick: (w: VocabWord) => void;
  isPicked: (id: string) => boolean;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts: VocabWord[] = [];
    const includes: VocabWord[] = [];
    for (const w of VOCAB) {
      const lw = w.word.toLowerCase();
      if (lw.startsWith(q)) starts.push(w);
      else if (lw.includes(q)) includes.push(w);
      if (starts.length >= 10) break;
    }
    return [...starts, ...includes].slice(0, 10);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative mt-2">
      <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 ring-1 ring-border focus-within:ring-primary/50">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={disabled ? "Word limit reached" : "Search Lexiq words…"}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-xl">
          {results.map((w) => {
            const already = isPicked(w.id);
            return (
              <button
                key={w.id}
                onClick={() => {
                  if (already || disabled) return;
                  onPick(w);
                  setQuery("");
                  setOpen(false);
                }}
                disabled={already || disabled}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-surface-2 disabled:opacity-50"
              >
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-foreground">{w.word}</p>
                  <p className="truncate text-xs text-muted-foreground">{w.studentDefinition}</p>
                </div>
                {already ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Plus className="h-4 w-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
      {open && query && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-border bg-card p-3 text-center text-xs text-muted-foreground shadow-xl">
          No Lexiq words match "{query}" — add it as a custom word below.
        </div>
      )}
    </div>
  );
}

function PremiumGate({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 text-center">
      <Crown className="h-12 w-12 text-gold" />
      <h1 className="mt-3 font-display text-2xl font-bold text-gradient-primary">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">This feature is included with Lexiq Premium.</p>
      <Link
        to="/premium"
        className="mt-5 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
      >
        Unlock Premium
      </Link>
    </main>
  );
}
