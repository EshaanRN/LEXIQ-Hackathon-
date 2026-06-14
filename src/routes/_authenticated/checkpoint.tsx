import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Mic, Keyboard, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { XPToast } from "@/components/XPToast";
import {
  applyMasteryScore,
  completeCheckpoint,
  pickCheckpointWords,
  setCheckpointInterval,
  useGame,
} from "@/lib/game-store";
import { gradeCheckpointAnswer } from "@/lib/grade.functions";
import type { VocabWord } from "@/data/vocab";

export const Route = createFileRoute("/_authenticated/checkpoint")({
  ssr: false,
  component: CheckpointPage,
});

const INTERVALS = [5, 10, 20, 25, 50, 75, 100];

type Mode = "typing" | "speaking";
type Phase = "intro" | "test" | "results";

interface Scored {
  word: VocabWord;
  pronunciationScore: number;
  definitionScore: number;
  contextScore: number;
  totalScore: number;
  feedback: string;
}

function CheckpointPage() {
  const g = useGame();
  const [mode, setMode] = useState<Mode>("typing");
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<Phase>("intro");
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Scored[]>([]);
  const [lastScored, setLastScored] = useState<Scored | null>(null);

  function start() {
    const words = pickCheckpointWords(count);
    if (words.length === 0) return;
    setQueue(words);
    setIdx(0);
    setResults([]);
    setLastScored(null);
    setPhase("test");
  }

  function handleScored(s: Scored) {
    applyMasteryScore(s.word.id, s.totalScore);
    setResults((prev) => [...prev, s]);
    setLastScored(s);
  }

  function advance() {
    const next = results;
    if (idx + 1 >= queue.length) {
      const perfect = next.every((r) => r.totalScore >= 95);
      const scoreMap: Record<string, number> = {};
      next.forEach((r) => (scoreMap[r.word.id] = r.totalScore));
      completeCheckpoint(scoreMap, perfect);
      setPhase("results");
    } else {
      setIdx((i) => i + 1);
    }
    setLastScored(null);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app" aria-label="Back to app" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Vocabulary Checkpoint</h1>
      </div>

      {phase === "intro" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Progress to next prompt</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${Math.min(100, ((g.wordsLearnedTotal - g.wordsAtLastCheckpoint) / g.checkpointInterval) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {g.wordsLearnedTotal - g.wordsAtLastCheckpoint} / {g.checkpointInterval} new words learned since last checkpoint
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Pick a mode</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ModeCard active={mode === "typing"} onClick={() => setMode("typing")} icon={<Keyboard className="h-5 w-5" />} title="Typing" desc="Type the definition + a sentence. Great for libraries." />
              <ModeCard active={mode === "speaking"} onClick={() => setMode("speaking")} icon={<Mic className="h-5 w-5" />} title="Speaking" desc="Pronounce + define + use the word aloud. AI grades you." />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Words per checkpoint</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[3, 5, 8, 10].map((n) => (
                <button key={n} onClick={() => setCount(n)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${count === n ? "bg-primary text-primary-foreground ring-primary" : "bg-surface-2 ring-border"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Prompt me every…</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {INTERVALS.map((n) => (
                <button key={n} onClick={() => setCheckpointInterval(n)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${g.checkpointInterval === n ? "bg-primary text-primary-foreground ring-primary" : "bg-surface-2 ring-border"}`}>
                  {n} words
                </button>
              ))}
            </div>
          </div>

          <button onClick={start}
            disabled={pickCheckpointWords(count).length === 0}
            className="w-full rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-40">
            Start Checkpoint
          </button>
          {pickCheckpointWords(count).length === 0 && (
            <p className="text-center text-xs text-muted-foreground">Learn a few words first, then come back!</p>
          )}
        </div>
      )}

      {phase === "test" && queue[idx] && !lastScored && (
        <CheckpointQuestion
          key={queue[idx].id}
          word={queue[idx]}
          mode={mode}
          index={idx}
          total={queue.length}
          onScored={handleScored}
        />
      )}

      {phase === "test" && lastScored && (
        <QuestionFeedback
          scored={lastScored}
          isLast={idx + 1 >= queue.length}
          onNext={advance}
        />
      )}

      {phase === "results" && <CheckpointResults results={results} onDone={() => setPhase("intro")} />}

      <XPToast />
    </main>
  );
}

function ModeCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button onClick={onClick}
      className={`rounded-2xl p-4 text-left ring-1 ${active ? "bg-primary/15 ring-primary glow-primary" : "bg-surface-2 ring-border"}`}>
      <div className="flex items-center gap-2 font-display text-base font-bold">{icon}{title}</div>
      <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
    </button>
  );
}

function CheckpointQuestion({ word, mode, index, total, onScored }: { word: VocabWord; mode: Mode; index: number; total: number; onScored: (s: Scored) => void }) {
  const grade = useServerFn(gradeCheckpointAnswer);
  const [pronunciationTranscript, setPron] = useState("");
  const [definition, setDef] = useState("");
  const [sentence, setSent] = useState("");
  const [listening, setListening] = useState<null | "pron" | "def" | "sent">(null);
  const [grading, setGrading] = useState(false);

  const Recognition: typeof window extends { SpeechRecognition: infer T } ? T : unknown =
    typeof window !== "undefined" ? ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) : undefined;
  const speechSupported = typeof window !== "undefined" && !!Recognition;

  function listen(target: "pron" | "def" | "sent") {
    if (!Recognition) return;
    const R = Recognition as unknown as { new (): {
      lang: string; interimResults: boolean; continuous: boolean;
      onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onend: (() => void) | null; start: () => void; stop: () => void;
    } };
    const rec = new R();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    setListening(target);
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(" ").trim();
      if (target === "pron") setPron(t);
      if (target === "def") setDef(t);
      if (target === "sent") setSent(t);
    };
    rec.onend = () => setListening(null);
    rec.start();
  }

  async function submit() {
    setGrading(true);
    try {
      const out = await grade({ data: {
        word: word.word,
        definition: word.studentDefinition,
        partOfSpeech: word.partOfSpeech,
        mode,
        pronunciationTranscript: pronunciationTranscript || undefined,
        definitionAnswer: definition,
        sentenceAnswer: sentence,
      }});
      onScored({ word, ...out });
    } finally {
      setGrading(false);
    }
  }

  const canSubmit = definition.trim().length > 3 && sentence.trim().length > 5 && (mode === "typing" || pronunciationTranscript.trim().length > 0);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Word {index + 1} of {total}</p>
      <div className="rounded-3xl border border-border bg-card p-6 text-center">
        <h2 className="font-display text-5xl font-bold text-gradient-primary">{word.word}</h2>
        <p className="mt-2 text-xs text-muted-foreground">{word.pronunciation} · {word.partOfSpeech}</p>
      </div>

      {mode === "speaking" && (
        <Block title="1. Pronounce the word aloud">
          {!speechSupported && <p className="text-xs text-danger">Speech recognition isn't supported in this browser. Try Chrome or switch to typing.</p>}
          {speechSupported && (
            <div className="flex items-center gap-2">
              <button onClick={() => listen("pron")} disabled={listening !== null}
                className={`rounded-full px-4 py-2 text-xs font-bold ring-1 ${listening === "pron" ? "bg-danger text-danger-foreground ring-danger animate-pulse" : "bg-surface-2 ring-border"}`}>
                <Mic className="mr-1 inline h-3.5 w-3.5" />
                {listening === "pron" ? "Listening…" : "Tap to speak"}
              </button>
              <span className="text-xs text-muted-foreground italic truncate">"{pronunciationTranscript}"</span>
            </div>
          )}
        </Block>
      )}

      <Block title={`${mode === "speaking" ? "2." : "1."} Define the word`}>
        <textarea value={definition} onChange={(e) => setDef(e.target.value)} rows={2}
          placeholder={`e.g. "${word.studentDefinition.split(" ").slice(0, 4).join(" ")}…"`}
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        {mode === "speaking" && speechSupported && (
          <button onClick={() => listen("def")} disabled={listening !== null}
            className="mt-2 rounded-full bg-surface-2 px-3 py-1 text-[11px] font-bold ring-1 ring-border">
            <Mic className="mr-1 inline h-3 w-3" />{listening === "def" ? "Listening…" : "Speak instead"}
          </button>
        )}
      </Block>

      <Block title={`${mode === "speaking" ? "3." : "2."} Use it in a sentence`}>
        <textarea value={sentence} onChange={(e) => setSent(e.target.value)} rows={2}
          placeholder="Write an original sentence that shows the meaning."
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        {mode === "speaking" && speechSupported && (
          <button onClick={() => listen("sent")} disabled={listening !== null}
            className="mt-2 rounded-full bg-surface-2 px-3 py-1 text-[11px] font-bold ring-1 ring-border">
            <Mic className="mr-1 inline h-3 w-3" />{listening === "sent" ? "Listening…" : "Speak instead"}
          </button>
        )}
      </Block>

      <button onClick={submit} disabled={!canSubmit || grading}
        className="w-full rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-40">
        {grading ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />AI grading…</> : "Submit Answer"}
      </button>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-primary">{title}</p>
      {children}
    </div>
  );
}

function CheckpointResults({ results, onDone }: { results: Scored[]; onDone: () => void }) {
  const avg = useMemo(() => Math.round(results.reduce((s, r) => s + r.totalScore, 0) / Math.max(1, results.length)), [results]);
  const perfect = avg >= 95;
  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-3xl border border-border bg-card p-6 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-gold" />
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">Checkpoint Score</p>
        <h2 className="mt-1 font-display text-5xl font-bold text-gradient-primary">{avg}</h2>
        <p className="mt-2 text-xs text-muted-foreground">{perfect ? "Perfect — +250 XP bonus!" : "+100 XP — keep going!"}</p>
      </div>
      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.word.id} className="rounded-2xl bg-card p-3 ring-1 ring-border">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-bold">{r.word.word}</p>
              <div className="flex items-center gap-2">
                {r.totalScore >= 76 ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
                <span className="font-display text-sm font-bold tabular-nums">{r.totalScore}</span>
              </div>
            </div>
            <div className="mt-1 flex gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Pron {r.pronunciationScore}</span>
              <span>Def {r.definitionScore}</span>
              <span>Ctx {r.contextScore}</span>
            </div>
            <p className="mt-1 text-xs text-foreground/80">{r.feedback}</p>
          </div>
        ))}
      </div>
      <button onClick={onDone} className="w-full rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary">
        Back to Test Menu
      </button>
    </div>
  );
}

// quiet unused warning for window typing helper
useEffect; // no-op
