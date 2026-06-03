import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "@/components/SwipeCard";
import { HUD, RankBar } from "@/components/HUD";
import { XPToast, type ToastData } from "@/components/XPToast";
import { answer, nextWord, getState } from "@/lib/game-store";
import type { VocabWord } from "@/data/vocab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAT Swipe — Master SAT vocab one swipe at a time" },
      {
        name: "description",
        content:
          "Gamified, swipe-based SAT vocabulary trainer. Earn XP, build streaks, master roots — feel like TikTok, learn like a champion.",
      },
      { property: "og:title", content: "SAT Swipe" },
      { property: "og:description", content: "Master SAT vocab one swipe at a time." },
    ],
  }),
  component: Home,
});

function Home() {
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    // pick 3 initial words from store logic — only on client
    const initial: VocabWord[] = [];
    let last: string | undefined;
    for (let i = 0; i < 3; i++) {
      const w = nextWord(last);
      initial.push(w);
      last = w.id;
    }
    setQueue(initial);
    // touch state to subscribe via useGame in children
    void getState();
  }, []);

  function handleAnswer(knew: boolean) {
    setQueue((q) => {
      const [top, ...rest] = q;
      if (!top) return q;
      const result = answer(top, knew);
      const id = Date.now();
      setToasts((t) => [...t, { id, xp: result.xpGain, mastered: result.becameMastered }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1200);

      const refill = nextWord(rest[rest.length - 1]?.id ?? top.id);
      return [...rest, refill];
    });
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
                  <SwipeCard word={w} onAnswer={handleAnswer} active={isTop} />
                </div>
              );
            })}
        </AnimatePresence>
      </div>

      <p className="pb-4 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
        Swipe · Learn · Level Up
      </p>

      <XPToast toasts={toasts} />
    </main>
  );
}
