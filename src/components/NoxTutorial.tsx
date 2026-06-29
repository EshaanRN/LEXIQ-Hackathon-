import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nox, type NoxMood } from "@/components/Nox";

type Step = {
  title: string;
  body: string;
  mood: NoxMood;
  highlight?: "card" | "right" | "left" | "goal" | "checkpoint" | "nav";
};

const STEPS: Step[] = [
  {
    title: "Welcome to your feed! 🦉",
    body: "I'll show you the ropes in 30 seconds. Tap Next anytime.",
    mood: "happy",
  },
  {
    title: "Swipe RIGHT if you know it →",
    body: "Already know the word? Swipe the card right (or tap the heart). You'll earn XP without slowing down.",
    mood: "excited",
    highlight: "right",
  },
  {
    title: "Swipe LEFT to learn ←",
    body: "Don't know it? Swipe left (or tap the ✕). I'll open a quick learn sheet with the meaning, an example, and +25 XP.",
    mood: "thinking",
    highlight: "left",
  },
  {
    title: "Hit your daily goal 🎯",
    body: "The bar up top tracks new words learned today. It resets every morning at 5 AM — keep your streak alive!",
    mood: "happy",
    highlight: "goal",
  },
  {
    title: "Checkpoints lock in memory 🧠",
    body: "After every few new words I'll ping you for a checkpoint — a tiny quiz on what you JUST learned. Skip it and the cycle restarts.",
    mood: "encourage",
    highlight: "checkpoint",
  },
  {
    title: "Explore from the bottom bar",
    body: "Dashboard, Tests, Shop, Profile — it's all down there. That's it. Go crush some words!",
    mood: "excited",
    highlight: "nav",
  },
];

export function NoxTutorial({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;

  function next() {
    if (isLast) onDone();
    else setI((n) => n + 1);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-end bg-black/70 backdrop-blur-sm p-6 pb-10">
      {/* Visual hint arrows around the screen */}
      <AnimatePresence>
        {step.highlight === "right" && (
          <motion.div
            key="hint-right"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: [0, 30, 0] }}
            exit={{ opacity: 0 }}
            transition={{ x: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
            className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 font-display text-5xl font-bold text-success drop-shadow-[0_0_20px_rgba(34,197,94,0.7)]"
          >
            →
          </motion.div>
        )}
        {step.highlight === "left" && (
          <motion.div
            key="hint-left"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: [0, -30, 0] }}
            exit={{ opacity: 0 }}
            transition={{ x: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
            className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 font-display text-5xl font-bold text-danger drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]"
          >
            ←
          </motion.div>
        )}
        {step.highlight === "goal" && (
          <motion.div
            key="hint-goal"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
            className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 text-4xl"
          >
            ⬆️
          </motion.div>
        )}
        {step.highlight === "nav" && (
          <motion.div
            key="hint-nav"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
            className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 text-4xl"
          >
            ⬇️
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={i}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="w-full max-w-sm rounded-3xl border-2 border-border bg-card p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <Nox mood={step.mood} size={84} />
          <div className="flex-1 pt-1">
            <h2 className="font-display text-lg font-bold leading-tight">{step.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {STEPS.map((_, n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n === i ? "w-6 bg-primary" : n < i ? "w-1.5 bg-primary/50" : "w-1.5 bg-surface-2"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onDone}
            className="rounded-full bg-surface-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground ring-1 ring-border"
          >
            Skip
          </button>
          <button
            onClick={next}
            className="flex-1 rounded-full bg-primary py-2.5 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground glow-primary"
          >
            {isLast ? "Start learning" : "Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
