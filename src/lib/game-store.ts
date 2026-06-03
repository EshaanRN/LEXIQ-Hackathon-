import { useEffect, useState, useSyncExternalStore } from "react";
import { VOCAB, type VocabWord } from "@/data/vocab";
import { supabase } from "@/integrations/supabase/client";
import { defaultAvatar, defaultOwned, type AvatarEquipped } from "@/lib/avatar";

export type Mastery = "unknown" | "learning" | "practicing" | "familiar" | "mastered";

interface WordState {
  mastery: Mastery;
  seen: number;
  correct: number;
  /** true if user has ever swiped left ("didn't know") on this word */
  wasMissed: boolean;
  lastSeenAt: number;
}

interface GameState {
  userId: string | null;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  lastActiveDay: string | null;
  rank: string;
  words: Record<string, WordState>;
  rootStrength: Record<string, number>;
  /** mastered roots that have already awarded their +100 bonus */
  rootBonusGiven: string[];
  /** ms of active study time accumulated, used for time-bonus */
  activeMs: number;
  /** activeMs at last time-bonus payout */
  lastBonusActiveMs: number;
  /** Date.now() of last interaction (used to debit active time) */
  lastInteractionAt: number;
  avatar: AvatarEquipped;
  ownedItems: string[];
  username: string | null;
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

// Active-time bonus: +10 XP every 5 minutes of active study
const BONUS_INTERVAL_MS = 5 * 60 * 1000;
const BONUS_XP = 10;
// Cap how much "active time" a single gap counts as (anti-AFK)
const MAX_GAP_MS = 30 * 1000;

function storageKey(userId: string) {
  return `sat-swipe-state::${userId}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState(userId: string | null): GameState {
  return {
    userId,
    xp: 0,
    coins: 0,
    level: 1,
    streak: 0,
    lastActiveDay: null,
    rank: RANKS[0].name,
    words: {},
    rootStrength: {},
    rootBonusGiven: [],
    activeMs: 0,
    lastBonusActiveMs: 0,
    lastInteractionAt: 0,
    avatar: defaultAvatar(),
    ownedItems: defaultOwned(),
    username: null,
  };
}

let state: GameState = defaultState(null);
const listeners = new Set<() => void>();
type Toast = { id: number; xp?: number; coins?: number; label: string };
let toastListeners = new Set<(t: Toast) => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined" || !state.userId) return;
  try {
    localStorage.setItem(storageKey(state.userId), JSON.stringify(state));
  } catch {}
  notify();
  scheduleProfileSync();
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleProfileSync() {
  if (typeof window === "undefined" || !state.userId) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(syncProfile, 1500);
}
async function syncProfile() {
  if (!state.userId) return;
  try {
    await supabase
      .from("profiles")
      .update({
        xp: state.xp,
        coins: state.coins,
        level: state.level,
        avatar: state.avatar as never,
        owned_items: state.ownedItems,
        equipped: state.avatar as never,
      })
      .eq("id", state.userId);
  } catch (e) {
    console.warn("profile sync failed", e);
  }
}

export function loadStateForUser(userId: string) {
  if (state.userId === userId) return;
  let next = defaultState(userId);
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey(userId)) : null;
    if (raw) next = { ...next, ...(JSON.parse(raw) as GameState), userId };
  } catch {}
  state = next;
  notify();
}

export function applyProfile(p: {
  username?: string | null;
  avatar?: AvatarEquipped;
  owned_items?: string[];
  xp?: number;
  coins?: number;
  level?: number;
}) {
  state = {
    ...state,
    username: p.username ?? state.username,
    avatar: p.avatar && Object.keys(p.avatar).length ? p.avatar : state.avatar,
    ownedItems: p.owned_items?.length ? p.owned_items : state.ownedItems,
    xp: typeof p.xp === "number" && p.xp > state.xp ? p.xp : state.xp,
    coins: typeof p.coins === "number" && p.coins > state.coins ? p.coins : state.coins,
    level: typeof p.level === "number" && p.level > state.level ? p.level : state.level,
  };
  state.rank = rankFor(state.xp);
  notify();
}

export function clearState() {
  state = defaultState(null);
  notify();
}

function rankFor(xp: number) {
  let r = RANKS[0].name;
  for (const x of RANKS) if (xp >= x.min) r = x.name;
  return r;
}

export function levelForXp(xp: number) {
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

function pushToast(t: Omit<Toast, "id">) {
  const toast = { ...t, id: Date.now() + Math.random() };
  toastListeners.forEach((l) => l(toast));
}

export function subscribeToasts(fn: (t: Toast) => void) {
  toastListeners.add(fn);
  return () => toastListeners.delete(fn);
}

function addXp(amount: number, label: string, coins = 0) {
  if (amount === 0 && coins === 0) return;
  const prevLevel = state.level;
  state.xp += amount;
  state.coins += coins;
  const lvl = levelForXp(state.xp);
  state.level = lvl.level;
  state.rank = rankFor(state.xp);
  pushToast({ xp: amount || undefined, coins: coins || undefined, label });
  if (state.level > prevLevel) {
    const coinReward = (state.level - prevLevel) * 100;
    state.coins += coinReward;
    pushToast({ xp: undefined, coins: coinReward, label: `Level ${state.level}!` });
  }
}

/** Tally active study time. Call on every meaningful interaction. */
export function tickActive() {
  const now = Date.now();
  if (state.lastInteractionAt) {
    const gap = Math.min(now - state.lastInteractionAt, MAX_GAP_MS);
    if (gap > 0) state.activeMs += gap;
  }
  state.lastInteractionAt = now;
  // Award any pending time bonuses
  while (state.activeMs - state.lastBonusActiveMs >= BONUS_INTERVAL_MS) {
    state.lastBonusActiveMs += BONUS_INTERVAL_MS;
    addXp(BONUS_XP, "Study Time Bonus");
  }
  persist();
}

/**
 * Called when the user swipes RIGHT on the top of the deck (claims to know).
 * No XP is awarded; mastery nudges up so the algorithm shows it less often.
 */
export function markKnown(word: VocabWord) {
  touchStreak();
  tickActive();
  const prev: WordState = state.words[word.id] ?? blank();
  const idx = MASTERY_ORDER.indexOf(prev.mastery);
  const nextMastery = MASTERY_ORDER[Math.min(idx + 1, MASTERY_ORDER.length - 1)];
  state.words[word.id] = {
    ...prev,
    mastery: nextMastery,
    seen: prev.seen + 1,
    correct: prev.correct + 1,
    lastSeenAt: Date.now(),
  };
  state.rootStrength[word.root] = (state.rootStrength[word.root] ?? 0) + 1;
  checkRootMastery(word.root);
  persist();
}

/**
 * Called when the user swipes LEFT or taps "don't know".
 * No XP yet — XP is only awarded after the user marks it as learned.
 */
export function markUnknown(word: VocabWord) {
  touchStreak();
  tickActive();
  const prev: WordState = state.words[word.id] ?? blank();
  state.words[word.id] = {
    ...prev,
    mastery: "learning",
    seen: prev.seen + 1,
    wasMissed: true,
    lastSeenAt: Date.now(),
  };
  state.rootStrength[word.root] = (state.rootStrength[word.root] ?? 0) - 1;
  persist();
}

/**
 * The user reviewed the learn sheet for a word they didn't know and
 * indicated they understand it now ("Learned" / double-tap heart / swipe right after review).
 * Awards:
 *   • +25 XP "Learned New Word"
 *   • +50 XP bonus if this word was previously missed and is now mastered
 *   • +100 XP if the root family becomes fully mastered
 */
export function markLearned(word: VocabWord) {
  touchStreak();
  tickActive();
  const prev: WordState = state.words[word.id] ?? blank();
  const idx = MASTERY_ORDER.indexOf(prev.mastery);
  const nextMastery = MASTERY_ORDER[Math.min(idx + 1, MASTERY_ORDER.length - 1)];
  const wasMissed = prev.wasMissed;
  const becameMastered = prev.mastery !== "mastered" && nextMastery === "mastered";

  state.words[word.id] = {
    ...prev,
    mastery: nextMastery,
    seen: prev.seen + 1,
    correct: prev.correct + 1,
    lastSeenAt: Date.now(),
  };
  state.rootStrength[word.root] = (state.rootStrength[word.root] ?? 0) + 1;

  addXp(25, "Learned New Word", 5);
  if (becameMastered && wasMissed) {
    addXp(50, "Mastered Missed Word", 25);
  }
  checkRootMastery(word.root);
  persist();
}

function checkRootMastery(root: string) {
  if (state.rootBonusGiven.includes(root)) return;
  const family = VOCAB.filter((w) => w.root === root);
  if (family.length < 2) return;
  const allMastered = family.every((w) => state.words[w.id]?.mastery === "mastered");
  if (allMastered) {
    state.rootBonusGiven.push(root);
    addXp(100, `Root "${root}-" Mastered`, 50);
  }
}

function blank(): WordState {
  return { mastery: "unknown", seen: 0, correct: 0, wasMissed: false, lastSeenAt: 0 };
}

export function nextWord(exclude?: string): VocabWord {
  const scored = VOCAB.filter((w) => w.id !== exclude).map((w) => {
    const ws = state.words[w.id];
    const masteryWeight = ws
      ? { unknown: 5, learning: 6, practicing: 4, familiar: 2, mastered: 0.4 }[ws.mastery]
      : 5;
    const rootWeight = Math.max(1, 4 - (state.rootStrength[w.root] ?? 0));
    const recencyPenalty = ws && Date.now() - ws.lastSeenAt < 30_000 ? 0.1 : 1;
    return { w, score: masteryWeight * rootWeight * recencyPenalty * Math.random() };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].w;
}

/* ---------- Shop / avatar ---------- */

export function purchaseItem(itemId: string, level: number, cost: number): { ok: boolean; reason?: string } {
  if (state.ownedItems.includes(itemId)) return { ok: false, reason: "Already owned" };
  if (state.level < level) return { ok: false, reason: `Reach level ${level} first` };
  if (state.coins < cost) return { ok: false, reason: "Not enough coins" };
  state.coins -= cost;
  state.ownedItems = [...state.ownedItems, itemId];
  pushToast({ label: "Item unlocked!" });
  persist();
  return { ok: true };
}

export function equipItem(slot: keyof AvatarEquipped, itemId: string) {
  if (!state.ownedItems.includes(itemId)) return;
  state.avatar = { ...state.avatar, [slot]: itemId };
  persist();
}

/* ---------- Store glue ---------- */

export function getState() {
  return state;
}
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useGame() {
  return useSyncExternalStore(
    (l) => subscribe(l),
    () => state,
    () => state,
  );
}
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
export { RANKS };
