import { useEffect, useState, useSyncExternalStore } from "react";
import { VOCAB, type VocabWord } from "@/data/vocab";

export type Mastery = "unknown" | "learning" | "practicing" | "familiar" | "mastered";

interface WordState {
  mastery: Mastery;
  seen: number;
  correct: number;
  lastSeenAt: number;
}

interface GameState {
  xp: number;
  coins: number;
  streak: number;
  lastActiveDay: string | null;
  rank: string;
  words: Record<string, WordState>;
  rootStrength: Record<string, number>; // root -> score (lower = weaker)
}

const RANKS = [
  { name: "Word Rookie", min: 0 },
  { name: "Context Climber", min: 150 },
  { name: "Vocabulary Scout", min: 400 },
  { name: "SAT Scholar", min: 900 },
  { name: "Reading Analyst", min: 1800 },
  { name: "Language Strategist", min: 3200 },
  { name: "Evidence Commander", min: 5000 },
  { name: "College Board Crusher", min: 8000 },
  { name: "Lexicon Master", min: 12000 },
  { name: "SAT Legend", min: 18000 },
];

const MASTERY_ORDER: Mastery[] = ["unknown", "learning", "practicing", "familiar", "mastered"];

const STORAGE_KEY = "sat-swipe-state-v1";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState(): GameState {
  return {
    xp: 0,
    coins: 0,
    streak: 0,
    lastActiveDay: null,
    rank: RANKS[0].name,
    words: {},
    rootStrength: {},
  };
}

function load(): GameState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

let state: GameState = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function rankFor(xp: number) {
  let r = RANKS[0].name;
  for (const x of RANKS) if (xp >= x.min) r = x.name;
  return r;
}

export function levelForXp(xp: number) {
  // simple curve: level n requires n*100 cumulative
  let level = 1;
  let need = 100;
  let acc = 0;
  while (xp >= acc + need) {
    acc += need;
    level++;
    need = Math.round(need * 1.15);
  }
  return { level, intoLevel: xp - acc, nextLevel: need };
}

function touchStreak() {
  const today = todayKey();
  if (state.lastActiveDay === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.streak = state.lastActiveDay === yesterday ? state.streak + 1 : 1;
  state.lastActiveDay = today;
}

function advanceMastery(w: WordState, correct: boolean): Mastery {
  const idx = MASTERY_ORDER.indexOf(w.mastery);
  if (correct) return MASTERY_ORDER[Math.min(idx + 1, MASTERY_ORDER.length - 1)];
  return MASTERY_ORDER[Math.max(idx - 1, 0)];
}

export function answer(word: VocabWord, knew: boolean) {
  touchStreak();
  const prev: WordState = state.words[word.id] ?? {
    mastery: "unknown",
    seen: 0,
    correct: 0,
    lastSeenAt: 0,
  };
  const nextMastery = advanceMastery(prev, knew);
  const wasMastered = prev.mastery === "mastered";
  const becameMastered = !wasMastered && nextMastery === "mastered";

  state.words[word.id] = {
    mastery: nextMastery,
    seen: prev.seen + 1,
    correct: prev.correct + (knew ? 1 : 0),
    lastSeenAt: Date.now(),
  };

  // root tracking
  const r = word.root;
  state.rootStrength[r] = (state.rootStrength[r] ?? 0) + (knew ? 1 : -1);

  let xpGain = knew ? 5 : 15; // missing rewards learning
  if (becameMastered) xpGain += 30;

  state.xp += xpGain;
  state.coins += knew ? 1 : 2;
  state.rank = rankFor(state.xp);
  persist();
  return { xpGain, becameMastered };
}

export function nextWord(exclude?: string): VocabWord {
  // weighted pick: prefer unknown/learning + weak-root words
  const scored = VOCAB.filter((w) => w.id !== exclude).map((w) => {
    const ws = state.words[w.id];
    const masteryWeight = ws
      ? { unknown: 5, learning: 4, practicing: 3, familiar: 2, mastered: 0.5 }[ws.mastery]
      : 6;
    const rootWeight = Math.max(1, 4 - (state.rootStrength[w.root] ?? 0));
    const recencyPenalty = ws && Date.now() - ws.lastSeenAt < 30_000 ? 0.1 : 1;
    return { w, score: masteryWeight * rootWeight * recencyPenalty * Math.random() };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].w;
}

export function getState() {
  return state;
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useGame() {
  const snapshot = useSyncExternalStore(
    (l) => subscribe(l),
    () => state,
    () => state,
  );
  return snapshot;
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export { RANKS };
