import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mic, Keyboard, Sparkles, CheckCircle2, XCircle, Loader2, RotateCcw, Crown, Lock, Pencil } from "lucide-react";
import { usePremium } from "@/lib/premium";
import { useServerFn } from "@tanstack/react-start";
import { XPToast } from "@/components/XPToast";
import {
  applyMasteryScore,
  clearCheckpointSession,
  completeCheckpoint,
  loadCheckpointSession,
  pickCheckpointWords,
  saveCheckpointSession,
  setCheckpointInterval,
  snoozeCheckpoint,
  useGame,
} from "@/lib/game-store";
import { gradeAnswerField, gradeCheckpointAnswer } from "@/lib/grade.functions";
import { VOCAB, type VocabWord } from "@/data/vocab";
import owlAsset from "@/assets/lexiq-owl.png.asset.json";
const owlMascot = owlAsset.url;

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

interface SavedSession {
  mode: Mode;
  count: number;
  phase: Phase;
  queueIds: string[];
  idx: number;
  results: Scored[];
  inProgress?: {
    pron: string;
    def: string;
    sent: string;
  };
}

function CheckpointPage() {
  const g = useGame();
  const { isPremium } = usePremium();
  const [mode, setMode] = useState<Mode>("typing");
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<Phase>("intro");
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Scored[]>([]);
  const [lastScored, setLastScored] = useState<Scored | null>(null);
  const [restoreOffer, setRestoreOffer] = useState<SavedSession | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<{ pron: string; def: string; sent: string } | null>(null);

  // Detect a saved-in-progress session on mount and offer to resume.
  useEffect(() => {
    const saved = loadCheckpointSession<SavedSession>();
    if (saved && saved.phase === "test" && saved.queueIds.length > 0 && saved.idx < saved.queueIds.length) {
      setRestoreOffer(saved);
    }
  }, []);

  // Persist whenever in test phase so an accidental exit can be resumed exactly.
  useEffect(() => {
    if (phase === "test") {
      saveCheckpointSession({
        mode, count, phase,
        queueIds: queue.map((w) => w.id),
        idx, results,
      } satisfies SavedSession);
    }
    if (phase === "results") {
      clearCheckpointSession();
    }
  }, [phase, mode, count, queue, idx, results]);

  function resume(saved: SavedSession) {
    const restored = saved.queueIds
      .map((id) => VOCAB.find((w) => w.id === id))
      .filter((w): w is VocabWord => !!w);
    if (restored.length === 0) {
      clearCheckpointSession();
      setRestoreOffer(null);
      return;
    }
    setMode(saved.mode);
    setCount(saved.count);
    setQueue(restored);
    setIdx(Math.min(saved.idx, restored.length - 1));
    setResults(saved.results);
    setInitialAnswers(saved.inProgress ?? null);
    setPhase("test");
    setRestoreOffer(null);
  }

  function discardSaved() {
    clearCheckpointSession();
    setRestoreOffer(null);
  }

  function start() {
    const words = pickCheckpointWords(count);
    if (words.length === 0) return;
    setQueue(words);
    setIdx(0);
    setResults([]);
    setLastScored(null);
    setInitialAnswers(null);
    setPhase("test");
  }

  function handleScored(s: Scored) {
    applyMasteryScore(s.word.id, s.totalScore);
    setResults((prev) => [...prev, s]);
    setLastScored(s);
    setInitialAnswers(null);
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
        <Link
          to="/app"
          aria-label="Back to app"
          onClick={() => {
            // Cancelling DOES NOT clear the saved session — user can resume
            // exactly where they left off. Snooze only the next-prompt counter.
            if (phase !== "results") snoozeCheckpoint();
          }}
          className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Vocabulary Checkpoint</h1>
      </div>

      {restoreOffer && phase === "intro" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/50 bg-primary/10 p-3">
          <RotateCcw className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Resume your checkpoint?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {restoreOffer.queueIds.length} words · on word {restoreOffer.idx + 1}. Nothing has been changed.
            </p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => resume(restoreOffer)} className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                Resume
              </button>
              <button onClick={discardSaved} className="rounded-full bg-surface-2 px-4 py-1.5 text-xs font-bold uppercase tracking-widest ring-1 ring-border">
                Start fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "intro" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Progress to next prompt</p>
            {(() => {
              const since = Math.max(0, g.wordsLearnedTotal - g.wordsAtLastCheckpoint);
              const pct = Math.min(100, (since / Math.max(1, g.checkpointInterval)) * 100);
              return (
                <>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {since} / {g.checkpointInterval} new words learned since last checkpoint
                  </p>
                </>
              );
            })()}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Pick a mode</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ModeCard active={mode === "typing"} onClick={() => setMode("typing")} icon={<Keyboard className="h-5 w-5" />} title="Typing" desc="Type the definition + a sentence. Great for libraries." />
              <ModeCard active={mode === "speaking"} onClick={() => setMode("speaking")} icon={<Mic className="h-5 w-5" />} title="Speaking" desc="Pronounce + define + use the word aloud. AI grades each part instantly." />
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

          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">More ways to test yourself</p>
            <div className="mt-2 space-y-2">
              <PremiumToolCard
                to="/custom-test"
                isPremium={isPremium}
                icon={<Pencil className="h-4 w-4 text-primary" />}
                title="Custom Test"
                desc="Build a quiz from your own word list."
              />
              <PremiumToolCard
                to="/sat-practice"
                isPremium={isPremium}
                icon={<Crown className="h-4 w-4 text-gold" />}
                title="Adaptive SAT Practice"
                desc="AI SAT questions on words you struggle with."
              />
            </div>
          </div>
        </div>
      )}

      {phase === "test" && queue[idx] && !lastScored && (
        <CheckpointQuestion
          key={queue[idx].id}
          word={queue[idx]}
          mode={mode}
          index={idx}
          total={queue.length}
          initial={initialAnswers ?? undefined}
          onProgress={(p) => {
            saveCheckpointSession({
              mode, count, phase: "test",
              queueIds: queue.map((w) => w.id),
              idx, results,
              inProgress: p,
            } satisfies SavedSession);
          }}
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

function PremiumToolCard({ to, isPremium, icon, title, desc }: { to: "/custom-test" | "/sat-practice"; isPremium: boolean; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-2xl bg-card p-4 ring-1 ring-border transition hover:border-primary">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-bold">{title}</span>
          {!isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold ring-1 ring-gold/40">
              <Lock className="h-3 w-3" /> Premium
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{isPremium ? desc : "Upgrade to Premium to unlock."}</p>
      </div>
      <span className="ml-3 flex-shrink-0">{icon}</span>
    </Link>
  );
}

interface FieldFeedback { score: number; correct: boolean; feedback: string; loading?: boolean }

function CheckpointQuestion({ word, mode, index, total, initial, onProgress, onScored }: {
  word: VocabWord;
  mode: Mode;
  index: number;
  total: number;
  initial?: { pron: string; def: string; sent: string };
  onProgress: (p: { pron: string; def: string; sent: string }) => void;
  onScored: (s: Scored) => void;
}) {
  const grade = useServerFn(gradeCheckpointAnswer);
  const gradeField = useServerFn(gradeAnswerField);
  const [pronunciationTranscript, setPron] = useState(initial?.pron ?? "");
  const [definition, setDef] = useState(initial?.def ?? "");
  const [sentence, setSent] = useState(initial?.sent ?? "");
  const [listening, setListening] = useState<null | "pron" | "def" | "sent">(null);
  const [grading, setGrading] = useState(false);
  const [pronFb, setPronFb] = useState<FieldFeedback | null>(null);
  const [defFb, setDefFb] = useState<FieldFeedback | null>(null);
  const [sentFb, setSentFb] = useState<FieldFeedback | null>(null);

  const Recognition: typeof window extends { SpeechRecognition: infer T } ? T : unknown =
    typeof window !== "undefined" ? ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) : undefined;
  const speechSupported = typeof window !== "undefined" && !!Recognition;

  // Save in-progress answers on every change so a refresh restores them exactly.
  const progressRef = useRef({ pron: pronunciationTranscript, def: definition, sent: sentence });
  useEffect(() => {
    progressRef.current = { pron: pronunciationTranscript, def: definition, sent: sentence };
    onProgress(progressRef.current);
  }, [pronunciationTranscript, definition, sentence]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkField(field: "pronunciation" | "definition" | "sentence", answer: string) {
    if (!answer.trim()) return;
    const setter = field === "pronunciation" ? setPronFb : field === "definition" ? setDefFb : setSentFb;
    setter({ score: 0, correct: false, feedback: "", loading: true });
    try {
      const fb = await gradeField({ data: {
        word: word.word,
        definition: word.studentDefinition,
        partOfSpeech: word.partOfSpeech,
        field, answer,
      }});
      setter({ ...fb, loading: false });
      playFeedbackTone(fb.correct);
    } catch {
      setter(null);
    }
  }

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
    let captured = "";
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(" ").trim();
      captured = t;
      if (target === "pron") { setPron(t); setPronFb(null); }
      if (target === "def") { setDef(t); setDefFb(null); }
      if (target === "sent") { setSent(t); setSentFb(null); }
    };
    rec.onend = () => {
      setListening(null);
      // Instant per-field grading in speaking mode — fires the moment speech ends.
      if (mode === "speaking" && captured) {
        const map = { pron: "pronunciation", def: "definition", sent: "sentence" } as const;
        checkField(map[target], captured);
      }
    };
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
          feedback={pronFb}
        />
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <h2 className="font-display text-5xl font-bold text-gradient-primary">{word.word}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{word.pronunciation} · {word.partOfSpeech}</p>
        </div>
      )}

      <Block title={`${mode === "speaking" ? "2." : "1."} Define the word`} feedback={defFb}>
        <textarea value={definition}
          onChange={(e) => { setDef(e.target.value); setDefFb(null); }}
          onBlur={() => mode === "speaking" && definition.trim() && !defFb && checkField("definition", definition)}
          rows={2}
          placeholder="Type the meaning in your own words…"
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        {mode === "speaking" && speechSupported && (
          <button onClick={() => listen("def")} disabled={listening !== null}
            className="mt-2 rounded-full bg-surface-2 px-3 py-1 text-[11px] font-bold ring-1 ring-border">
            <Mic className="mr-1 inline h-3 w-3" />{listening === "def" ? "Listening…" : "Speak instead"}
          </button>
        )}
      </Block>

      <Block title={`${mode === "speaking" ? "3." : "2."} Use it in a sentence`} feedback={sentFb}>
        <textarea value={sentence}
          onChange={(e) => { setSent(e.target.value); setSentFb(null); }}
          onBlur={() => mode === "speaking" && sentence.trim() && !sentFb && checkField("sentence", sentence)}
          rows={2}
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

function DuoSpeakingHeader({ word, listening, transcript, supported, onSpeak, feedback }: {
  word: VocabWord; listening: boolean; transcript: string; supported: boolean; onSpeak: () => void; feedback: FieldFeedback | null;
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
          {feedback && <InlineFeedback fb={feedback} />}
        </div>
      )}
    </div>
  );
}

function InlineFeedback({ fb }: { fb: FieldFeedback }) {
  if (fb.loading) {
    return <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Checking…</p>;
  }
  return (
    <div className={`mt-2 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${fb.correct ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
      {fb.correct ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      <span>{fb.correct ? "Correct" : "Not quite"} · {fb.score}</span>
      <span className="hidden text-muted-foreground sm:inline">— {fb.feedback}</span>
    </div>
  );
}

function LexiqMascot({ listening }: { listening: boolean }) {
  return (
    <div className={`relative h-24 w-24 shrink-0 ${listening ? "animate-bounce" : ""}`}>
      <img
        src={owlMascot}
        alt="Lexiq owl mascot"
        width={96}
        height={96}
        loading="lazy"
        className="h-full w-full object-contain drop-shadow-xl"
        draggable={false}
      />
    </div>
  );
}

function Block({ title, children, feedback }: { title: string; children: React.ReactNode; feedback?: FieldFeedback | null }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">{title}</p>
        {feedback && <InlineFeedback fb={feedback} />}
      </div>
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
