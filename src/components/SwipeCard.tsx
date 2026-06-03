import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { VocabWord } from "@/data/vocab";
import { Star, Volume2, Heart, X } from "lucide-react";

interface Props {
  word: VocabWord;
  onKnown: () => void;
  onUnknown: () => void;
  active: boolean;
}

export function SwipeCard({ word, onKnown, onUnknown, active }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const knowOpacity = useTransform(x, [20, 140], [0, 1]);
  const dontKnowOpacity = useTransform(x, [-140, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-400, -250, 0, 250, 400], [0, 0.6, 1, 0.6, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = 130;
    if (info.offset.x > threshold || info.velocity.x > 600) {
      animate(x, 600, { duration: 0.25 });
      setTimeout(onKnown, 180);
    } else if (info.offset.x < -threshold || info.velocity.x < -600) {
      animate(x, -600, { duration: 0.25 });
      setTimeout(onUnknown, 180);
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
      >
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
          LEARN
        </motion.div>

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
              Do you already know this word? Swipe right to confirm, left to learn it for XP.
            </p>
          </div>

          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground/60">
            ← Learn (+25 XP) · Know it →
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              animate(x, -600, { duration: 0.25 });
              setTimeout(onUnknown, 180);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger ring-1 ring-danger/40 transition hover:scale-110 hover:bg-danger/25"
            aria-label="Don't know"
          >
            <X className="h-7 w-7" strokeWidth={3} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              animate(x, 600, { duration: 0.25 });
              setTimeout(onKnown, 180);
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
