import { motion, AnimatePresence } from "framer-motion";
import { Heart, Volume2, BookOpen } from "lucide-react";
import { useRef, useState } from "react";
import type { VocabWord } from "@/data/vocab";

interface Props {
  word: VocabWord | null;
  onLearned: () => void;
  onSkip: () => void;
  viewOnly?: boolean;
}

function speakWord(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  u.pitch = 1;
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
}

export function LearnSheet({ word, onLearned, onSkip, viewOnly }: Props) {
  const lastTap = useRef(0);
  const [hearted, setHearted] = useState(false);

  function handleHeartTap() {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      // double tap
      setHearted(true);
      setTimeout(onLearned, 250);
    } else {
      lastTap.current = now;
    }
  }

  return (
    <AnimatePresence>
      {word && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onSkip}
        >
          <motion.div
            className="relative w-full max-w-md h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 pb-8"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted-foreground/40" />

            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/30">
                {viewOnly ? "Word details" : "Learn this word"}
              </span>
              {!viewOnly && <span className="text-xs text-muted-foreground">+25 XP on Learn</span>}
            </div>

            <h2 className="mt-4 font-display text-4xl font-bold text-gradient-primary">
              {word.word}
            </h2>
            <button
              onClick={() => speakWord(word.word)}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border transition hover:bg-primary/15 hover:text-primary hover:ring-primary/40"
              aria-label={`Hear pronunciation of ${word.word}`}
            >
              <Volume2 className="h-3 w-3" /> {word.pronunciation || "Tap to hear"}
            </button>

            <Section icon={<BookOpen className="h-3.5 w-3.5" />} label="Definition" tone="primary">
              <p className="text-sm leading-relaxed text-foreground/90">{word.studentDefinition}</p>
            </Section>

            {word.synonyms && word.synonyms.length > 0 && (
              <Section label="Similar Words" tone="accent">
                <div className="flex flex-wrap gap-1.5">
                  {word.synonyms.map((s) => (
                    <span key={s} className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent ring-1 ring-accent/30">
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            <Section label="SAT Example" tone="accent">
              <p className="text-sm italic text-foreground/80">"{word.satContext}"</p>
            </Section>

            <Section label="Root Analysis" tone="primary">
              <div className="flex flex-wrap gap-2 font-display text-base">
                {word.prefix && (
                  <span className="rounded-lg bg-primary/15 px-2 py-1 text-primary">{word.prefix}-</span>
                )}
                <span className="rounded-lg bg-accent/20 px-2 py-1 text-accent">{word.root}</span>
                {word.suffix && (
                  <span className="rounded-lg bg-gold/15 px-2 py-1 text-gold">-{word.suffix}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{word.rootMeaning}</p>
            </Section>


            {viewOnly ? (
              <div className="mt-6">
                <button
                  onClick={onSkip}
                  className="w-full rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={onSkip}
                  className="flex-1 rounded-full bg-surface-2 py-3 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground ring-1 ring-border"
                >
                  Not yet
                </button>
                <button
                  onClick={handleHeartTap}
                  className={`grid h-12 w-12 place-items-center rounded-full ring-1 transition ${
                    hearted
                      ? "bg-danger text-danger-foreground ring-danger"
                      : "bg-danger/15 text-danger ring-danger/40"
                  }`}
                  aria-label="Double tap to learn"
                  title="Double-tap to mark as learned"
                >
                  <Heart className={`h-5 w-5 ${hearted ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={onLearned}
                  className="flex-1 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
                >
                  Learned
                </button>
              </div>
            )}
            {!viewOnly && (
              <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground/70">
                Double-tap ❤️ or press Learned to claim XP
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  icon,
  label,
  tone,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  tone: "primary" | "accent" | "dashed";
  children: React.ReactNode;
}) {
  const cls =
    tone === "dashed"
      ? "border border-dashed border-primary/40 bg-primary/5"
      : "bg-surface-2 ring-1 ring-border";
  const labelColor = tone === "accent" ? "text-accent" : "text-primary";
  return (
    <div className={`mt-3 rounded-2xl p-4 ${cls}`}>
      <p className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest ${labelColor}`}>
        {icon} {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
