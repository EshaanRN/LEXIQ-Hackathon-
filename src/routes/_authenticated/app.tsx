import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "@/components/SwipeCard";
import { HUD, RankBar } from "@/components/HUD";
import { XPToast } from "@/components/XPToast";
import { LearnSheet } from "@/components/LearnSheet";
import { SearchBar } from "@/components/SearchBar";
import { DailyGoal } from "@/components/DailyGoal";
import { AdSlot } from "@/components/AdSlot";
import { AdInterstitial } from "@/components/AdInterstitial";
import { markKnown, markUnknown, markLearned, nextWord, tickActive, snoozeCheckpoint, isCheckpointDue } from "@/lib/game-store";
import type { VocabWord } from "@/data/vocab";

export const Route = createFileRoute("/_authenticated/app")({
  ssr: false,
  component: Feed,
});

function Feed() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [learning, setLearning] = useState<VocabWord | null>(null);
  const [viewing, setViewing] = useState<VocabWord | null>(null);
  const [checkpointPrompt, setCheckpointPrompt] = useState(false);





  useEffect(() => {
    const initial: VocabWord[] = [];
    for (let i = 0; i < 3; i++) {
      const w = nextWord(initial.map((x) => x.id));
      initial.push(w);
    }
    setQueue(initial);
    if (isCheckpointDue()) setCheckpointPrompt(true);
    // Periodic re-check: if user dismissed the modal without snoozing (e.g. tap
    // outside) and keeps learning, we re-surface it every 30s while still due.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        tickActive();
        if (isCheckpointDue()) setCheckpointPrompt(true);
      }
    }, 30_000);
    const onFocus = () => { if (isCheckpointDue()) setCheckpointPrompt(true); };
    const onVis = () => { if (document.visibilityState === "visible" && isCheckpointDue()) setCheckpointPrompt(true); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);


  function advance() {
    setQueue((q) => {
      const [, ...rest] = q;
      const refill = nextWord(rest.map((x) => x.id));
      return [...rest, refill];
    });
  }
  function handleKnown() {
    const top = queue[0];
    if (!top) return;
    const { checkpointDue } = markKnown(top);
    advance();
    if (checkpointDue) setCheckpointPrompt(true);
  }
  function handleUnknown() {
    const top = queue[0];
    if (!top) return;
    markUnknown(top);
    setLearning(top);
  }
  function handleLearned() {
    if (!learning) return;
    const { checkpointDue } = markLearned(learning);
    setLearning(null);
    advance();
    if (checkpointDue) setCheckpointPrompt(true);
  }
  function handleSkipLearn() {
    setLearning(null);
    advance();
  }

  // Desktop keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (learning) return;
      if (e.target instanceof HTMLElement && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); handleKnown(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); handleUnknown(); }
      else if (e.key === " ") {
        e.preventDefault();
        const top = queue[0];
        if (top) { markUnknown(top); setLearning(top); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queue, learning]);

  return (
    <main className="mx-auto flex h-screen w-full max-w-2xl flex-col pb-20">
      <h1 className="sr-only">Lexiq vocabulary feed</h1>
      <HUD />
      <RankBar />
      <DailyGoal />
      <SearchBar onSelect={setViewing} />

      <div className="relative mx-5 my-3 flex-1 min-h-0">

        <AnimatePresence>
          {queue.slice(0, 3).reverse().map((w, idx, arr) => {
            const isTop = idx === arr.length - 1;
            const depth = arr.length - 1 - idx;
            return (
              <div key={w.id + "-" + depth} className="absolute inset-0"
                style={{
                  transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
                  zIndex: 10 - depth,
                  opacity: isTop ? 1 : 0.7,
                  pointerEvents: isTop ? "auto" : "none",
                }}>
                <SwipeCard word={w} onKnown={handleKnown} onUnknown={handleUnknown} active={isTop} />
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="hidden md:block pb-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        ← Learn · → Know it · Space = open sheet
      </p>

      <div className="mx-5 mb-2 hidden md:block">
        <AdSlot variant="banner" />
      </div>

      <XPToast />
      <LearnSheet word={learning} onLearned={handleLearned} onSkip={handleSkipLearn} />
      <LearnSheet word={viewing} viewOnly onLearned={() => setViewing(null)} onSkip={() => setViewing(null)} />
      <AdInterstitial />

      {checkpointPrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 ring-1 ring-border text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Milestone</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-gradient-primary">Ready for a Vocabulary Checkpoint?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Prove mastery of what you've learned. +100 XP for passing — or skip and keep swiping.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { snoozeCheckpoint(); setCheckpointPrompt(false); }}
                className="flex-1 rounded-full bg-surface-2 py-3 text-xs font-bold uppercase tracking-widest ring-1 ring-border">Not now</button>
              <button onClick={() => { setCheckpointPrompt(false); navigate({ to: "/checkpoint" }); }}
                className="flex-1 rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground glow-primary">Let's go</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
