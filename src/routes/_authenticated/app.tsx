import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, Shuffle } from "lucide-react";
import { SwipeCard } from "@/components/SwipeCard";
import { HUD, RankBar } from "@/components/HUD";
import { XPToast } from "@/components/XPToast";
import { LearnSheet } from "@/components/LearnSheet";
import { SearchBar } from "@/components/SearchBar";
import { DailyGoal } from "@/components/DailyGoal";
import { NoxTutorial } from "@/components/NoxTutorial";
import { StudyModeSelector } from "@/components/StudyModeSelector";

import { AddCustomWordDialog } from "@/components/AddCustomWordDialog";
import { loadCustomVocab } from "@/lib/custom-vocab";
import {
  markKnown,
  markUnknown,
  markLearned,
  nextWord,
  tickActive,
  snoozeCheckpoint,
  markCheckpointPromptShown,
  shouldShowCheckpointPrompt,
  reshuffleFeed,
} from "@/lib/game-store";
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addInitial, setAddInitial] = useState("");

  useEffect(() => { loadCustomVocab(); }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("lexiq:show-tutorial") === "1") {
        setShowTutorial(true);
      }
    } catch { /* noop */ }
  }, []);

  function dismissTutorial() {
    setShowTutorial(false);
    try { localStorage.removeItem("lexiq:show-tutorial"); } catch { /* noop */ }
  }

  const triggerCheckpointPrompt = useCallback(() => {
    if (!shouldShowCheckpointPrompt()) return;
    markCheckpointPromptShown();
    setCheckpointPrompt(true);
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Lexiq checkpoint ready", {
          body: "You hit your word goal for this checkpoint. Take it now or skip to restart the next cycle.",
        });
      } catch { /* browser blocked notification */ }
    }
  }, []);




  useEffect(() => {
    const initial: VocabWord[] = [];
    for (let i = 0; i < 3; i++) {
      const w = nextWord(initial.map((x) => x.id));
      initial.push(w);
    }
    setQueue(initial);
    triggerCheckpointPrompt();
    // Periodic re-check catches cross-device progress syncs and any missed
    // render, but each milestone only notifies once until the user skips or
    // completes the checkpoint.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        tickActive();
        triggerCheckpointPrompt();
      }
    }, 30_000);
    const onFocus = () => { triggerCheckpointPrompt(); };
    const onVis = () => { if (document.visibilityState === "visible") triggerCheckpointPrompt(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [triggerCheckpointPrompt]);


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
    if (checkpointDue) triggerCheckpointPrompt();
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
    if (checkpointDue) triggerCheckpointPrompt();
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
      else if (e.key === "Enter") { e.preventDefault(); advance(); }
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
      <StudyModeSelector
        onChange={() => {
          // Rebuild the queue immediately so the new exam filter takes effect
          // without waiting for the current top card to be swiped.
          const initial: VocabWord[] = [];
          for (let i = 0; i < 3; i++) {
            const w = nextWord(initial.map((x) => x.id));
            initial.push(w);
          }
          setQueue(initial);
        }}
      />
      
      <div className="mt-2 flex items-center gap-2 mx-5">
        <div className="flex-1"><SearchBar onSelect={setViewing} onAddRequest={(q) => { setAddInitial(q); setAddOpen(true); }} /></div>
        <button
          onClick={() => {
            reshuffleFeed();
            const initial: VocabWord[] = [];
            for (let i = 0; i < 3; i++) {
              const w = nextWord(initial.map((x) => x.id));
              initial.push(w);
            }
            setQueue(initial);
          }}
          className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted-foreground ring-1 ring-border hover:bg-surface-3 hover:text-foreground"
          aria-label="Shuffle to a fresh set of words"
          title="Shuffle feed — get a new set of words"
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <button
          onClick={() => { setAddInitial(""); setAddOpen(true); }}
          className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30 hover:bg-primary/25"
          aria-label="Add your own word"
          title="Add your own word"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mx-5 my-3 flex-1 min-h-0">

        <AnimatePresence>
          {queue.slice(0, 1).map((w) => (
            <div key={w.id} className="absolute inset-0" style={{ zIndex: 10 }}>
              <SwipeCard word={w} onKnown={handleKnown} onUnknown={handleUnknown} active />
            </div>
          ))}
        </AnimatePresence>
      </div>

      <p className="hidden md:block pb-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        ← Learn · → Know it · Space = open sheet
      </p>

      <XPToast />
      <LearnSheet word={learning} onLearned={handleLearned} onSkip={handleSkipLearn} />
      <LearnSheet word={viewing} viewOnly onLearned={() => setViewing(null)} onSkip={() => setViewing(null)} />


      {checkpointPrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 ring-1 ring-border text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Milestone</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-gradient-primary">Ready for a Vocabulary Checkpoint?</h2>
            <p className="mt-2 text-sm text-muted-foreground">You reached your checkpoint interval. Take it now, or tap Not now to cancel this checkpoint and restart the count for the next set of new words.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { snoozeCheckpoint(); setCheckpointPrompt(false); }}
                className="flex-1 rounded-full bg-surface-2 py-3 text-xs font-bold uppercase tracking-widest ring-1 ring-border">Not now</button>
              <button onClick={() => { setCheckpointPrompt(false); navigate({ to: "/checkpoint" }); }}
                className="flex-1 rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground glow-primary">Let's go</button>
            </div>
          </div>
        </div>
      )}

      {showTutorial && <NoxTutorial onDone={dismissTutorial} />}

      <AddCustomWordDialog
        open={addOpen}
        initialWord={addInitial}
        onClose={() => setAddOpen(false)}
        onAdded={(w) => setViewing(w)}
      />
    </main>
  );
}
