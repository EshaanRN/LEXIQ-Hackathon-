import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "@/components/SwipeCard";
import { HUD, RankBar } from "@/components/HUD";
import { XPToast } from "@/components/XPToast";
import { LearnSheet } from "@/components/LearnSheet";
import { BottomNav } from "@/components/BottomNav";
import { markKnown, markUnknown, markLearned, nextWord, tickActive } from "@/lib/game-store";
import type { VocabWord } from "@/data/vocab";

export const Route = createFileRoute("/_authenticated/app")({
  ssr: false,
  component: Feed,
});

function Feed() {
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [learning, setLearning] = useState<VocabWord | null>(null);

  useEffect(() => {
    const initial: VocabWord[] = [];
    let last: string | undefined;
    for (let i = 0; i < 3; i++) {
      const w = nextWord(last);
      initial.push(w);
      last = w.id;
    }
    setQueue(initial);

    // Tick active time periodically so background time doesn't count
    const id = setInterval(() => {
      if (document.visibilityState === "visible") tickActive();
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  function advance() {
    setQueue((q) => {
      const [, ...rest] = q;
      const refill = nextWord(rest[rest.length - 1]?.id);
      return [...rest, refill];
    });
  }

  function handleKnown() {
    const top = queue[0];
    if (!top) return;
    markKnown(top);
    advance();
  }
  function handleUnknown() {
    const top = queue[0];
    if (!top) return;
    markUnknown(top);
    setLearning(top);
  }
  function handleLearned() {
    if (!learning) return;
    markLearned(learning);
    setLearning(null);
    advance();
  }
  function handleSkipLearn() {
    setLearning(null);
    advance();
  }

  return (
    <main className="mx-auto flex h-screen w-full max-w-md flex-col">
      <HUD />
      <RankBar />

      <div className="relative mx-5 my-5 flex-1">
        <AnimatePresence>
          {queue
            .slice(0, 3)
            .reverse()
            .map((w, idx, arr) => {
              const isTop = idx === arr.length - 1;
              const depth = arr.length - 1 - idx;
              return (
                <div
                  key={w.id + "-" + depth}
                  className="absolute inset-0"
                  style={{
                    transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
                    zIndex: 10 - depth,
                    opacity: isTop ? 1 : 0.7,
                    pointerEvents: isTop ? "auto" : "none",
                  }}
                >
                  <SwipeCard
                    word={w}
                    onKnown={handleKnown}
                    onUnknown={handleUnknown}
                    active={isTop}
                  />
                </div>
              );
            })}
        </AnimatePresence>
      </div>

      <BottomNav />
      <XPToast />
      <LearnSheet word={learning} onLearned={handleLearned} onSkip={handleSkipLearn} />
    </main>
  );
}
