import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle } from "lucide-react";

import { useServerFn } from "@tanstack/react-start";
import { completeOnboarding as completeOnboardingFn } from "@/lib/onboarding.functions";
import { Nox, type NoxMood } from "@/components/Nox";
import { Avatar } from "@/components/Avatar";
import {
  DICEBEAR_STYLES,
  BACKGROUND_PALETTES,
  defaultAvatar,
  defaultOwned,
  randomSeed,
  styleOwned,
  bgOwned,
  type AvatarConfig,
  type DicebearStyleId,
} from "@/lib/avatar";
import { VOCAB, type ExamType } from "@/data/vocab";
import { applyProfile, loadStateForUser, markKnown, RANKS } from "@/lib/game-store";

export const Route = createFileRoute("/_authenticated/onboarding")({
  ssr: false,
  component: Onboarding,
});

const INTERESTS = [
  "📚 Reading", "🎬 Movies", "🎮 Gaming", "🎵 Music", "⚽ Sports",
  "🎨 Art", "🔬 Science", "💻 Tech", "✈️ Travel", "🍕 Food",
  "👗 Fashion", "🏛️ History",
];

const STEPS = ["Username", "Exam", "Avatar", "Interests", "Placement", "Rank"];

const STEP_MESSAGES: Record<number, string> = {
  0: "First things first — what should the leaderboard call you?",
  1: "Which exam are we crushing together?",
  2: "Now make yourself look legendary.",
  3: "Tell me what you love — I'll slip it into your example sentences.",
  4: "Quick check! Be honest — no judgment from me. 🦉",
  5: "Look at that! You're officially on the map.",
};

const HAPPY_LINES = [
  "Yes! Nailed it! 🎉",
  "Boom — you knew that one!",
  "Look at you, wordsmith!",
  "That's the energy I love!",
];
const ENCOURAGE_LINES = [
  "All good — that's why we're here!",
  "No worries, I'll teach you that one.",
  "We'll add it to your list. You got this!",
  "Brand new word unlocked for tomorrow!",
];

function Onboarding() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const [step, setStep] = useState(0);
  const [intro, setIntro] = useState(true);
  const [introLine, setIntroLine] = useState(0);
  const [username, setUsername] = useState("");
  const [exam, setExam] = useState<ExamType>("sat");
  const [avatar, setAvatar] = useState<AvatarConfig>(defaultAvatar());
  const [interests, setInterests] = useState<string[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [noxMood, setNoxMood] = useState<NoxMood>("idle");
  const [noxMsg, setNoxMsg] = useState<string>(STEP_MESSAGES[0]);
  const completeOnboarding = useServerFn(completeOnboardingFn);

  const quizWords = VOCAB.slice(0, 5);

  const introLines = [
    "Hoo there! I'm Nox. 🦉",
    "I'll be your guide here at Lexiq.",
    "Ready? Let's build your profile!",
  ];

  // Auto-advance the intro lines, but the user can also tap to skip ahead.
  useEffect(() => {
    if (!intro) return;
    if (introLine >= introLines.length) {
      const t = setTimeout(() => setIntro(false), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIntroLine((i) => i + 1), 2400);
    return () => clearTimeout(t);
  }, [intro, introLine, introLines.length]);

  useEffect(() => {
    if (intro) return;
    setNoxMood(step === 4 ? "thinking" : step === 5 ? "excited" : "idle");
    setNoxMsg(STEP_MESSAGES[step] ?? "");
  }, [step, intro]);

  function toggleInterest(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }
  function answerQuiz(knew: boolean) {
    if (knew) {
      setCorrect((c) => c + 1);
      setKnownIds((ids) => [...ids, quizWords[quizIdx].id]);
      setNoxMood("happy");
      setNoxMsg(HAPPY_LINES[Math.floor(Math.random() * HAPPY_LINES.length)]);
    } else {
      setNoxMood("encourage");
      setNoxMsg(ENCOURAGE_LINES[Math.floor(Math.random() * ENCOURAGE_LINES.length)]);
    }
    setTimeout(() => {
      if (quizIdx + 1 >= quizWords.length) setStep(5);
      else {
        setQuizIdx((i) => i + 1);
        setNoxMood("thinking");
        setNoxMsg("Next one — ready?");
      }
    }, 1100);
  }


  function rankFromScore(c: number) {
    const idx = Math.min(RANKS.length - 1, Math.floor((c / quizWords.length) * 4));
    return RANKS[idx].name;
  }

  async function finish() {
    setSaving(true);
    const startingRank = rankFromScore(correct);
    const finalUsername = username.trim() || `Player${Math.floor(Math.random() * 9999)}`;
    const owned = defaultOwned();
    try {
      await completeOnboarding({
        data: {
          username: finalUsername,
          avatar: avatar as unknown as Record<string, unknown>,
          interests,
          startingRank,
          exam,
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Treat "already completed" as success so users aren't stuck on retry.
      if (!/already been completed/i.test(msg)) {
        console.error("completeOnboarding failed", e);
        setSaving(false);
        alert(msg || "Couldn't save your profile. Try again.");
        return;
      }
    }
    loadStateForUser(user.id);
    applyProfile({
      username: finalUsername,
      avatar,
      owned_items: owned,
      exam,
    });
    for (const id of knownIds) {
      const w = VOCAB.find((v) => v.id === id);
      if (w) markKnown(w);
    }
    navigate({ to: "/app", replace: true });
  }


  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
      <AnimatePresence>
        {intro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-primary/10 px-6"
          >
            {/* Soft animated background blobs */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
              animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
              animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Nox slides in smoothly from the side, then gentle sway */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ x: [0, 6, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              >
                <Nox mood="idle" size={200} speaking />
              </motion.div>
            </motion.div>

            {/* Big speech card — Duolingo style */}
            <div className="relative mt-10 w-full max-w-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={introLine}
                  initial={{ opacity: 0, y: 16, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="relative rounded-3xl border-2 border-border bg-card px-6 py-5 text-center shadow-2xl"
                >
                  <span
                    aria-hidden
                    className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-border bg-card"
                  />
                  <p className="font-display text-xl font-bold leading-snug">
                    {introLines[Math.min(introLine, introLines.length - 1)]}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dots showing intro progress */}
              <div className="mt-4 flex justify-center gap-1.5">
                {introLines.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i <= introLine ? "w-6 bg-primary" : "w-1.5 bg-surface-2"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                onClick={() =>
                  introLine >= introLines.length - 1
                    ? setIntro(false)
                    : setIntroLine((i) => i + 1)
                }
                className="rounded-full bg-primary px-8 py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
              >
                {introLine >= introLines.length - 1 ? "Let's go" : "Continue"}
              </button>
              <button
                onClick={() => setIntro(false)}
                className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Skip intro
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
      </div>

      <div className="mb-4">
        <Nox mood={noxMood} message={noxMsg} size={72} />
      </div>


      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="flex-1">
          {step === 0 && (
            <>
              <h1 className="font-display text-3xl font-bold">Pick your username</h1>
              <p className="mt-1 text-sm text-muted-foreground">This is how you'll appear on the leaderboards.</p>
              <input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. wordwizard24"
                className="mt-6 w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-lg font-display focus:border-primary focus:outline-none" />
              <NextBtn disabled={username.trim().length < 3} onClick={() => setStep(1)} />
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-3xl font-bold">Which exam are you studying for?</h1>
              <p className="mt-1 text-sm text-muted-foreground">This shapes every word we show you. Change it anytime.</p>
              <div className="mt-6 space-y-3">
                <ExamCard id="sat" active={exam === "sat"} onClick={() => setExam("sat")} title="SAT" desc="College Board vocab, evidence words, transition cues, academic language." />
                <ExamCard id="act" active={exam === "act"} onClick={() => setExam("act")} title="ACT" desc="Reading, Science, English-section vocab and context clues." />
                <ExamCard id="both" active={exam === "both"} onClick={() => setExam("both")} title="SAT + ACT" desc="Combined high-frequency word list — words that appear on both exams." />
              </div>
              <NextBtn onClick={() => setStep(2)} label="Continue" />
            </>
          )}

          {step === 2 && (
            <AvatarBuilder avatar={avatar} setAvatar={setAvatar} owned={defaultOwned()} onNext={() => setStep(3)} />
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-3xl font-bold">What are you into?</h1>
              <p className="mt-1 text-sm text-muted-foreground">We'll tailor example sentences to your interests.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const on = interests.includes(i);
                  return (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${on ? "bg-primary text-primary-foreground ring-primary glow-primary" : "bg-surface-2 text-foreground ring-border"}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
              <NextBtn disabled={interests.length < 2} onClick={() => setStep(4)} label="Continue" />
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="font-display text-3xl font-bold">Quick placement</h1>
              <p className="mt-1 text-sm text-muted-foreground">Do you know this word? Honest answers = better recommendations.</p>
              <div className="mt-8 min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIdx}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 0.96 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="rounded-3xl border border-border bg-card p-8 text-center"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Word {quizIdx + 1} of {quizWords.length}</p>
                    <h2 className="mt-4 font-display text-5xl font-bold text-gradient-primary">{quizWords[quizIdx].word}</h2>
                    <p className="mt-2 text-xs text-muted-foreground">{quizWords[quizIdx].pronunciation}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => answerQuiz(false)}
                  className="flex-1 rounded-full bg-surface-2 py-3 font-display font-bold uppercase tracking-widest ring-1 ring-border">Don't know</button>
                <button onClick={() => answerQuiz(true)}
                  className="flex-1 rounded-full bg-primary py-3 font-display font-bold uppercase tracking-widest text-primary-foreground glow-primary">Know it</button>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Avatar equipped={avatar} size={140} />
              <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">Starting rank</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-gradient-primary">{rankFromScore(correct)}</h1>
              <p className="mt-4 text-sm text-muted-foreground">You knew {correct} of {quizWords.length}. Let's start mastering the rest.</p>
              <button onClick={finish} disabled={saving}
                className="mt-10 w-full rounded-full bg-primary py-4 font-display text-base font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-60">
                {saving ? "Preparing your feed..." : "Enter Lexiq"}
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function ExamCard({ active, onClick, title, desc }: { id: string; active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button onClick={onClick}
      className={`w-full rounded-2xl p-4 text-left ring-1 transition ${active ? "bg-primary/15 ring-primary glow-primary" : "bg-surface-2 ring-border"}`}>
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function NextBtn({ disabled, onClick, label = "Next" }: { disabled?: boolean; onClick: () => void; label?: string }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className="mt-8 w-full rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-40">
      {label}
    </button>
  );
}

export function AvatarBuilder({
  avatar, setAvatar, owned, onNext,
}: { avatar: AvatarConfig; setAvatar: (a: AvatarConfig) => void; owned: string[]; onNext?: () => void }) {
  const [tab, setTab] = useState<"style" | "background">("style");
  const compact = Boolean(onNext);
  const styleList = compact ? DICEBEAR_STYLES.filter((s) => s.free).slice(0, 6) : DICEBEAR_STYLES;
  const bgList = compact ? BACKGROUND_PALETTES.filter((b) => b.cost === 0).slice(0, 8) : BACKGROUND_PALETTES;

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Build your avatar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tap shuffle for a new look. More styles unlock as you level up.</p>

      <div className="mt-6 flex flex-col items-center">
        <motion.div
          key={`${avatar.style}-${avatar.seed}-${avatar.backgroundColor.join(",")}`}
          initial={{ scale: 0.9, opacity: 0.6, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <Avatar equipped={avatar} size={160} />
        </motion.div>
        <button onClick={() => setAvatar({ ...avatar, seed: randomSeed() })}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold ring-1 ring-border transition-all duration-200 hover:bg-surface hover:scale-[1.03] active:scale-95">
          <Shuffle className="h-4 w-4" /> Shuffle look
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <TabBtn label="Style" active={tab === "style"} onClick={() => setTab("style")} />
        <TabBtn label="Background" active={tab === "background"} onClick={() => setTab("background")} />
      </div>

      <AnimatePresence mode="wait">
        {tab === "style" && (
          <motion.div
            key="style"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-3 grid grid-cols-3 gap-2"
          >
            {styleList.map((s) => {
              const unlocked = styleOwned(owned, s.id);
              const active = avatar.style === s.id;
              return (
                <motion.button
                  key={s.id}
                  disabled={!unlocked}
                  whileHover={unlocked ? { scale: 1.04, y: -2 } : undefined}
                  whileTap={unlocked ? { scale: 0.95 } : undefined}
                  onClick={() => setAvatar({ ...avatar, style: s.id as DicebearStyleId, seed: `preview-${s.id}` })}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-2 ring-1 transition-colors ${active ? "ring-primary bg-primary/15 glow-primary" : "ring-border bg-surface-2 hover:bg-surface"} ${!unlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <Avatar equipped={{ style: s.id as DicebearStyleId, seed: `preview-${s.id}`, backgroundColor: avatar.backgroundColor }} size={56} />
                  <span className="text-[9px] uppercase tracking-widest">{s.name}</span>
                  {!unlocked && "level" in s && <span className="text-[9px] text-muted-foreground">Lv {s.level}</span>}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {tab === "background" && (
          <motion.div
            key="bg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-3 grid grid-cols-4 gap-2"
          >
            {bgList.map((b) => {
              const unlocked = bgOwned(owned, b.id);
              const active = avatar.backgroundColor.join(",") === b.colors.join(",");
              return (
                <motion.button
                  key={b.id}
                  disabled={!unlocked}
                  whileHover={unlocked ? { scale: 1.05, y: -2 } : undefined}
                  whileTap={unlocked ? { scale: 0.95 } : undefined}
                  onClick={() => setAvatar({ ...avatar, backgroundColor: b.colors })}
                  className={`flex h-16 flex-col items-center justify-end rounded-2xl p-1 ring-2 transition ${active ? "ring-primary glow-primary" : "ring-border"} ${!unlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ background: `linear-gradient(135deg, ${b.colors.map((c) => "#" + c).join(",")})` }}
                >
                  <span className="rounded bg-black/50 px-1 text-[8px] uppercase tracking-widest text-white">{b.name}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {onNext && <NextBtn onClick={onNext} label="Looks Good" />}
    </>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`rounded-full py-2 text-[11px] font-semibold uppercase tracking-widest ring-1 transition-all duration-200 active:scale-95 ${active ? "bg-primary text-primary-foreground ring-primary glow-primary" : "bg-surface-2 text-muted-foreground ring-border hover:text-foreground hover:bg-surface"}`}>
      {label}
    </button>
  );
}

