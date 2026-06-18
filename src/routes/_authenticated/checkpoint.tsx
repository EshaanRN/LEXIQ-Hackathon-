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
  snoozeCheckpoint,
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
                <button key={n} type="button" onClick={() => setCheckpointInterval(n)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition active:scale-95 ${g.checkpointInterval === n ? "bg-primary text-primary-foreground ring-primary" : "bg-surface-2 ring-border hover:bg-surface-3"}`}>
                  {n} words
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Currently: every <span className="font-bold text-foreground">{g.checkpointInterval}</span> words</p>
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

      {mode === "speaking" ? (
        <DuoSpeakingHeader
          word={word}
          listening={listening === "pron"}
          transcript={pronunciationTranscript}
          supported={speechSupported}
          onSpeak={() => listen("pron")}
        />
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <h2 className="font-display text-5xl font-bold text-gradient-primary">{word.word}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{word.pronunciation} · {word.partOfSpeech}</p>
        </div>
      )}

      <Block title={`${mode === "speaking" ? "2." : "1."} Define the word`}>
        <textarea value={definition} onChange={(e) => setDef(e.target.value)} rows={2}
          placeholder="Type the meaning in your own words…"
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

function DuoSpeakingHeader({ word, listening, transcript, supported, onSpeak }: {
  word: VocabWord; listening: boolean; transcript: string; supported: boolean; onSpeak: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-end gap-3">
        <LexiqMascot listening={listening} />
        <div className="relative mb-1 flex-1 rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-3 ring-1 ring-border">
          <span className="absolute -left-1.5 bottom-2 h-3 w-3 rotate-45 bg-surface-2 ring-1 ring-border" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
          <p className="text-[10px] uppercase tracking-widest text-primary">Tap the mic and say</p>
          <p className="mt-0.5 font-display text-2xl font-bold">{word.word}</p>
          <p className="text-[11px] text-muted-foreground">{word.pronunciation} · {word.partOfSpeech}</p>
        </div>
      </div>

      {!supported ? (
        <p className="mt-4 text-xs text-danger">Speech recognition isn't supported here. Try Chrome or switch to typing.</p>
      ) : (
        <div className="mt-5 flex flex-col items-center">
          <button onClick={onSpeak} disabled={listening}
            aria-label={listening ? "Listening" : "Tap to speak"}
            className={`relative grid h-20 w-20 place-items-center rounded-full text-primary-foreground transition ${
              listening
                ? "bg-danger animate-pulse ring-4 ring-danger/30"
                : "bg-primary glow-primary hover:scale-105 ring-4 ring-primary/20"
            }`}>
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" />}
            <Mic className="relative h-9 w-9" />
          </button>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {listening ? "Listening…" : "Tap to speak"}
          </p>
          {transcript && (
            <p className="mt-2 max-w-xs truncate text-center text-xs italic text-muted-foreground">"{transcript}"</p>
          )}
        </div>
      )}
    </div>
  );
}

function LexiqMascot({ listening }: { listening: boolean }) {
  // Cute purple owl mascot — Duolingo-inspired, friendly SVG.
  return (
    <div className={`relative h-24 w-24 shrink-0 ${listening ? "animate-bounce" : ""}`}>
      <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-xl" aria-hidden>
        <ellipse cx="60" cy="112" rx="30" ry="4" fill="rgba(0,0,0,0.25)" />
        {/* feet */}
        <ellipse cx="48" cy="106" rx="6" ry="3" fill="#f59e0b" />
        <ellipse cx="72" cy="106" rx="6" ry="3" fill="#f59e0b" />
        {/* body (purple gradient) */}
        <defs>
          <radialGradient id="owlBody" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </radialGradient>
          <linearGradient id="owlBelly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>
        {/* tufts */}
        <path d="M28 28 Q34 14 44 26 Z" fill="#7c3aed" />
        <path d="M92 28 Q86 14 76 26 Z" fill="#7c3aed" />
        {/* body */}
        <ellipse cx="60" cy="64" rx="40" ry="42" fill="url(#owlBody)" />
        {/* wings */}
        <path d="M22 60 Q14 80 28 96 Q34 86 32 70 Z" fill="#6d28d9" />
        <path d="M98 60 Q106 80 92 96 Q86 86 88 70 Z" fill="#6d28d9" />
        {/* belly */}
        <ellipse cx="60" cy="74" rx="24" ry="28" fill="url(#owlBelly)" />
        {/* eye whites */}
        <circle cx="46" cy="50" r="14" fill="white" />
        <circle cx="74" cy="50" r="14" fill="white" />
        {/* pupils */}
        <circle cx="47" cy="52" r="6" fill="#1f2937" />
        <circle cx="75" cy="52" r="6" fill="#1f2937" />
        <circle cx="49" cy="50" r="2" fill="white" />
        <circle cx="77" cy="50" r="2" fill="white" />
        {/* beak */}
        <path d="M54 64 Q60 72 66 64 Q60 70 54 64 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
        {/* cheeks */}
        <circle cx="40" cy="68" r="4" fill="#f9a8d4" opacity="0.6" />
        <circle cx="80" cy="68" r="4" fill="#f9a8d4" opacity="0.6" />
      </svg>
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

function playFeedbackTone(correct: boolean) {
  if (typeof window === "undefined") return;
  try {
    const Ctx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    if (correct) {
      // Cheerful two-note "ding"
      [880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.25, now + i * 0.08 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);
        osc.connect(g).connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    } else {
      // Low buzz
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.35);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    /* ignore audio errors */
  }
}

function QuestionFeedback({ scored, isLast, onNext }: { scored: Scored; isLast: boolean; onNext: () => void }) {
  const correct = scored.totalScore >= 76;
  useEffect(() => { playFeedbackTone(correct); }, [correct]);
  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className={`rounded-3xl border p-6 text-center ${correct ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
        {correct ? <CheckCircle2 className="mx-auto h-12 w-12 text-success animate-scale-in" /> : <XCircle className="mx-auto h-12 w-12 text-danger animate-scale-in" />}
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{correct ? "Correct!" : "Not quite"}</p>
        <h2 className="mt-1 font-display text-4xl font-bold">{scored.word.word}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{scored.word.pronunciation} · {scored.word.partOfSpeech}</p>
        <div className="mt-3 font-display text-5xl font-bold text-gradient-primary tabular-nums">{scored.totalScore}</div>
      </div>

      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="text-[10px] uppercase tracking-widest text-primary">Coach feedback</p>
        <p className="mt-1 text-sm">{scored.feedback}</p>
        <div className="mt-3 flex gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Pron {scored.pronunciationScore}</span>
          <span>Def {scored.definitionScore}</span>
          <span>Ctx {scored.contextScore}</span>
        </div>
      </div>

      <button onClick={onNext}
        className="w-full rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary transition active:scale-95">
        {isLast ? "See Results" : "Next Word"}
      </button>
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
