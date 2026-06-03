import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState } from "react";
import type { VocabWord } from "@/data/vocab";
import { Star, Volume2, Heart, X } from "lucide-react";

interface Props {
  word: VocabWord;
  onAnswer: (knew: boolean) => void;
  active: boolean;
}

export function SwipeCard({ word, onAnswer, active }: Props) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const knowOpacity = useTransform(x, [20, 140], [0, 1]);
  const dontKnowOpacity = useTransform(x, [-140, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-400, -250, 0, 250, 400], [0, 0.6, 1, 0.6, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = 130;
    if (info.offset.x > threshold || info.velocity.x > 600) {
      animate(x, 600, { duration: 0.25 });
      setTimeout(() => onAnswer(true), 180);
    } else if (info.offset.x < -threshold || info.velocity.x < -600) {
      animate(x, -600, { duration: 0.25 });
      setTimeout(() => onAnswer(false), 180);
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity: cardOpacity }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      whileTap={{ cursor: "grabbing" }}
    >
      <div
        className="relative h-full w-full rounded-3xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
        onClick={() => active && setFlipped((f) => !f)}
      >
        {/* swipe indicators */}
        <motion.div
          style={{ opacity: knowOpacity }}
          className="absolute top-8 left-8 z-20 rotate-[-12deg] rounded-xl border-4 border-success px-4 py-2 font-display text-2xl font-bold text-success"
        >
          KNOW IT
        </motion.div>
        <motion.div
          style={{ opacity: dontKnowOpacity }}
          className="absolute top-8 right-8 z-20 rotate-[12deg] rounded-xl border-4 border-danger px-4 py-2 font-display text-2xl font-bold text-danger"
        >
          NEW
        </motion.div>

        {!flipped ? <FrontFace word={word} /> : <BackFace word={word} />}

        {/* bottom action row */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              animate(x, -600, { duration: 0.25 });
              setTimeout(() => onAnswer(false), 180);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger ring-1 ring-danger/40 transition hover:scale-110 hover:bg-danger/25"
            aria-label="Don't know"
          >
            <X className="h-7 w-7" strokeWidth={3} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped((f) => !f);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-foreground ring-1 ring-border transition hover:scale-110"
            aria-label="Flip"
          >
            <span className="font-display text-sm font-bold">FLIP</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              animate(x, 600, { duration: 0.25 });
              setTimeout(() => onAnswer(true), 180);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/40 transition hover:scale-110 hover:bg-success/25"
            aria-label="Know it"
          >
            <Heart className="h-7 w-7 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DifficultyChip({ d }: { d: string }) {
  const map: Record<string, string> = {
    easy: "bg-success/15 text-success ring-success/30",
    medium: "bg-gold/15 text-gold ring-gold/30",
    hard: "bg-danger/15 text-danger ring-danger/30",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ${map[d]}`}>
      {d}
    </span>
  );
}

function FrontFace({ word }: { word: VocabWord }) {
  return (
    <div className="flex h-full flex-col p-8">
      <div className="flex items-center justify-between">
        <DifficultyChip d={word.difficulty} />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < word.frequency ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          {word.partOfSpeech}
        </p>
        <h1 className="font-display text-6xl font-bold tracking-tight text-gradient-primary">
          {word.word}
        </h1>
        <button
          className="mt-4 flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm text-muted-foreground ring-1 ring-border"
          onClick={(e) => e.stopPropagation()}
        >
          <Volume2 className="h-4 w-4" />
          {word.pronunciation}
        </button>

        <p className="mt-10 max-w-sm text-base text-muted-foreground">
          Do you know this word? Swipe right if you do, left to learn it.
        </p>
      </div>

      <p className="text-center text-xs uppercase tracking-widest text-muted-foreground/60">
        Tap to reveal
      </p>
    </div>
  );
}

function BackFace({ word }: { word: VocabWord }) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-8 pb-28">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Definition</p>
        <h2 className="mt-1 font-display text-3xl font-bold">{word.word}</h2>
        <p className="mt-2 text-base text-foreground/90">{word.studentDefinition}</p>
      </div>

      <div className="rounded-2xl bg-surface-2 p-4 ring-1 ring-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">SAT Context</p>
        <p className="mt-2 text-sm italic text-foreground/80">"{word.satContext}"</p>
      </div>

      <div className="rounded-2xl bg-surface-2 p-4 ring-1 ring-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Root Analysis</p>
        <div className="mt-2 flex flex-wrap gap-2 font-display text-lg">
          {word.prefix && (
            <span className="rounded-lg bg-primary/15 px-2 py-1 text-primary">{word.prefix}-</span>
          )}
          <span className="rounded-lg bg-accent/20 px-2 py-1 text-accent">{word.root}</span>
          {word.suffix && (
            <span className="rounded-lg bg-gold/15 px-2 py-1 text-gold">-{word.suffix}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{word.rootMeaning}</p>
      </div>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Memory Hook</p>
        <p className="mt-2 text-sm text-foreground/90">{word.mnemonic}</p>
      </div>
    </div>
  );
}
