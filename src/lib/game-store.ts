import { useEffect, useState, useSyncExternalStore } from "react";
import { VOCAB, type VocabWord, type ExamType } from "@/data/vocab";
import { VOCAB_ALL, wordMatchesExam, applyExamVariant } from "@/data/vocab-all";
import { defaultAvatar, defaultOwned, type AvatarConfig } from "@/lib/avatar";

export type Mastery = "unknown" | "learning" | "practicing" | "familiar" | "mastered";

interface WordState {
  mastery: Mastery;
  seen: number;
  correct: number;
  wasMissed: boolean;
  lastSeenAt: number;
  /** 0-100 from checkpoint testing */
  masteryScore?: number;
  /** wordsLearnedTotal snapshot when this word became known/mastered/familiar */
  knownAtTotal?: number;
  /** First time the word was learned (markLearned or markKnown when new) */
  firstLearnedAt?: number;
  /** User-flagged "I might forget this" → reintroduced often until mastered */
  reviewFlagged?: boolean;
}

// Re-show a known/mastered word for a refresher only after the user has
// learned this many NEW words in between. Picked randomly above this floor
// so the user keeps seeing new vocabulary first.
const REFRESHER_COOLDOWN = 120;

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
  rootBonusGiven: string[];
  activeMs: number;
  lastBonusActiveMs: number;
  lastInteractionAt: number;
  avatar: AvatarConfig;
  ownedItems: string[];
  username: string | null;
  exam: ExamType;
  /** Exams the user has "added" — the swipe feed unions across these.
   *  Persisted via clientState (the DB `exam` column is locked post-onboarding). */
  selectedExams: Exclude<ExamType, "both">[];
  checkpointInterval: number;
  /** Total NEW words the user has learned (used to trigger checkpoint prompts) */
  wordsLearnedTotal: number;
  /** Count snapshot at last successful checkpoint */
  wordsAtLastCheckpoint: number;
  /** Total-word milestone that has already shown a checkpoint reminder */
  checkpointPromptedAtTotal: number;
  /** Pass count of checkpoints (for rewards) */
  checkpointsPassed: number;
  perfectCheckpoints: number;
  /** User-set daily learning target (new words per day) */
  dailyGoal: number;
  /** New words learned during current day */
  wordsLearnedToday: number;
  /** ISO date string for the day wordsLearnedToday is tracking */
  goalDay: string | null;
  /** True once the goal-reached toast has fired for goalDay */
  goalCelebratedDay: string | null;
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
const BONUS_INTERVAL_MS = 5 * 60 * 1000;
const BONUS_XP = 10;
const MAX_GAP_MS = 30 * 1000;

function storageKey(userId: string) {
  return `sat-swipe-state::${userId}`;
}
// Daily cycle resets at 5 AM local time. Subtract 5 hours so any timestamp
// before 5 AM is bucketed into the previous calendar day's key.
const DAY_RESET_HOUR = 5;
function todayKey() {
  const d = new Date(Date.now() - DAY_RESET_HOUR * 60 * 60 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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
    exam: "sat",
    selectedExams: ["sat"],
    checkpointInterval: 20,
    wordsLearnedTotal: 0,
    wordsAtLastCheckpoint: 0,
    checkpointPromptedAtTotal: 0,
    checkpointsPassed: 0,
    perfectCheckpoints: 0,
    dailyGoal: 15,
    wordsLearnedToday: 0,
    goalDay: null,
    goalCelebratedDay: null,
  };
}

let state: GameState = defaultState(null);
const listeners = new Set<() => void>();
type Toast = { id: number; xp?: number; coins?: number; label: string };
const toastListeners = new Set<(t: Toast) => void>();

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
    const scores: Record<string, number> = {};
    for (const [id, ws] of Object.entries(state.words)) {
      if (typeof ws.masteryScore === "number") scores[id] = ws.masteryScore;
      else {
        const m = ws.mastery;
        scores[id] = m === "mastered" ? 95 : m === "familiar" ? 80 : m === "practicing" ? 60 : m === "learning" ? 35 : 0;
      }
    }
    const clientState = {
      v: 1,
      syncedAt: Date.now(),
      words: state.words,
      streak: state.streak,
      lastActiveDay: state.lastActiveDay,
      wordsLearnedTotal: state.wordsLearnedTotal,
      wordsLearnedToday: state.wordsLearnedToday,
      goalDay: state.goalDay,
      goalCelebratedDay: state.goalCelebratedDay,
      wordsAtLastCheckpoint: state.wordsAtLastCheckpoint,
      checkpointPromptedAtTotal: state.checkpointPromptedAtTotal,
      checkpointsPassed: state.checkpointsPassed,
      perfectCheckpoints: state.perfectCheckpoints,
      rootStrength: state.rootStrength,
      rootBonusGiven: state.rootBonusGiven,
      activeMs: state.activeMs,
      lastBonusActiveMs: state.lastBonusActiveMs,
      selectedExams: state.selectedExams,
    };
    const { syncClientProgress } = await import("@/lib/progress.functions");
    await syncClientProgress({
      data: {
        avatar: state.avatar as unknown as Record<string, unknown>,
        exam: state.exam,
        checkpointInterval: state.checkpointInterval,
        masteryScores: scores,
        dailyGoal: state.dailyGoal,
        clientState,
      },
    });
  } catch (e) {
    console.warn("profile sync failed", e);
  }
}

// --- Server-authoritative economy queue ---
let pendingXp = 0;
let pendingCoins = 0;
let pendingWordsLearned = 0;
let economyTimer: ReturnType<typeof setTimeout> | null = null;
let economyInFlight = false;

function scheduleEconomyFlush() {
  if (typeof window === "undefined" || !state.userId) return;
  if (economyTimer) clearTimeout(economyTimer);
  economyTimer = setTimeout(flushEconomy, 800);
}

async function flushEconomy() {
  if (!state.userId || economyInFlight) return;
  if (pendingXp === 0 && pendingCoins === 0 && pendingWordsLearned === 0) return;
  const xp = pendingXp;
  const coins = pendingCoins;
  const wld = pendingWordsLearned;
  pendingXp = 0;
  pendingCoins = 0;
  pendingWordsLearned = 0;
  economyInFlight = true;
  try {
    const { awardEconomy } = await import("@/lib/economy.functions");
    const res = await awardEconomy({ data: { xp, coins, wordsLearnedDelta: wld } });
    state = {
      ...state,
      // Do not let an older in-flight flush overwrite newer local progress.
      xp: Math.max(state.xp, res.xp),
      coins: Math.max(state.coins, res.coins),
      level: Math.max(state.level, res.level),
      wordsLearnedTotal: Math.max(state.wordsLearnedTotal, res.wordsLearnedTotal),
      rank: rankFor(Math.max(state.xp, res.xp)),
    };
    notify();
  } catch (e) {
    // Roll the deltas back in so we retry next flush.
    pendingXp += xp;
    pendingCoins += coins;
    pendingWordsLearned += wld;
    console.warn("economy flush failed", e);
  } finally {
    economyInFlight = false;
  }
}


export function loadStateForUser(userId: string) {
  if (state.userId === userId) return;
  let next = defaultState(userId);
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey(userId)) : null;
    if (raw) next = { ...next, ...(JSON.parse(raw) as GameState), userId };
  } catch {}
  // Repair drift: progress to next checkpoint must always start at 0+.
  if (next.wordsAtLastCheckpoint > next.wordsLearnedTotal) {
    next.wordsAtLastCheckpoint = next.wordsLearnedTotal;
  }
  next.checkpointPromptedAtTotal ??= next.wordsAtLastCheckpoint ?? 0;
  if (next.checkpointPromptedAtTotal > next.wordsLearnedTotal) {
    next.checkpointPromptedAtTotal = next.wordsLearnedTotal;
  }
  // Backfill selectedExams for users saved before the multi-exam era.
  if (!Array.isArray(next.selectedExams) || next.selectedExams.length === 0) {
    const primary = next.exam === "both" ? "sat" : next.exam;
    next.selectedExams = [primary as Exclude<ExamType, "both">];
  }
  state = next;
  notify();
}

export function applyProfile(p: {
  username?: string | null;
  avatar?: AvatarConfig;
  owned_items?: string[];
  xp?: number;
  coins?: number;
  level?: number;
  exam?: ExamType;
  checkpoint_interval?: number;
  words_learned_total?: number;
  daily_goal?: number;
  client_state?: Record<string, unknown> | null;
}) {
  state = {
    ...state,
    username: p.username ?? state.username,
    avatar: p.avatar && p.avatar.style ? p.avatar : state.avatar,
    ownedItems: p.owned_items?.length ? p.owned_items : state.ownedItems,
    xp: typeof p.xp === "number" && p.xp > state.xp ? p.xp : state.xp,
    coins: typeof p.coins === "number" && p.coins > state.coins ? p.coins : state.coins,
    level: typeof p.level === "number" && p.level > state.level ? p.level : state.level,
    exam: p.exam ?? state.exam,
    checkpointInterval: p.checkpoint_interval ?? state.checkpointInterval,
    wordsLearnedTotal:
      typeof p.words_learned_total === "number" && p.words_learned_total > state.wordsLearnedTotal
        ? p.words_learned_total
        : state.wordsLearnedTotal,
    dailyGoal: typeof p.daily_goal === "number" && p.daily_goal > 0 ? p.daily_goal : state.dailyGoal,
  };
  // Merge cross-device snapshot — server wins when it's newer than the local snapshot.
  const cs = p.client_state as {
    syncedAt?: number;
    words?: Record<string, WordState>;
    streak?: number;
    lastActiveDay?: string | null;
    wordsLearnedTotal?: number;
    wordsLearnedToday?: number;
    goalDay?: string | null;
    goalCelebratedDay?: string | null;
    wordsAtLastCheckpoint?: number;
    checkpointPromptedAtTotal?: number;
    checkpointsPassed?: number;
    perfectCheckpoints?: number;
    rootStrength?: Record<string, number>;
    rootBonusGiven?: string[];
    activeMs?: number;
    lastBonusActiveMs?: number;
    selectedExams?: Exclude<ExamType, "both">[];
  } | null | undefined;
  if (cs && typeof cs === "object" && cs.syncedAt) {
    const localSyncedAt = (state as unknown as { _lastSyncedAt?: number })._lastSyncedAt ?? 0;
    if (cs.syncedAt >= localSyncedAt) {
      // Merge per-word state: take the entry with the higher seen count or later lastSeenAt.
      const mergedWords: Record<string, WordState> = { ...state.words };
      for (const [id, ws] of Object.entries(cs.words ?? {})) {
        const local = mergedWords[id];
        if (!local || (ws.lastSeenAt ?? 0) >= (local.lastSeenAt ?? 0)) {
          mergedWords[id] = ws;
        }
      }
      state = {
        ...state,
        words: mergedWords,
        streak: Math.max(state.streak, cs.streak ?? 0),
        lastActiveDay: cs.lastActiveDay ?? state.lastActiveDay,
        wordsLearnedTotal: Math.max(state.wordsLearnedTotal, cs.wordsLearnedTotal ?? 0),
        wordsLearnedToday: Math.max(state.wordsLearnedToday, cs.wordsLearnedToday ?? 0),
        goalDay: cs.goalDay ?? state.goalDay,
        goalCelebratedDay: cs.goalCelebratedDay ?? state.goalCelebratedDay,
        wordsAtLastCheckpoint: Math.max(state.wordsAtLastCheckpoint, cs.wordsAtLastCheckpoint ?? 0),
        checkpointPromptedAtTotal: Math.max(state.checkpointPromptedAtTotal, cs.checkpointPromptedAtTotal ?? 0),
        checkpointsPassed: Math.max(state.checkpointsPassed, cs.checkpointsPassed ?? 0),
        perfectCheckpoints: Math.max(state.perfectCheckpoints, cs.perfectCheckpoints ?? 0),
        rootStrength: { ...state.rootStrength, ...(cs.rootStrength ?? {}) },
        rootBonusGiven: Array.from(new Set([...state.rootBonusGiven, ...(cs.rootBonusGiven ?? [])])),
        activeMs: Math.max(state.activeMs, cs.activeMs ?? 0),
        lastBonusActiveMs: Math.max(state.lastBonusActiveMs, cs.lastBonusActiveMs ?? 0),
        selectedExams: Array.isArray(cs.selectedExams) && cs.selectedExams.length > 0
          ? cs.selectedExams
          : state.selectedExams,
      };
      (state as unknown as { _lastSyncedAt?: number })._lastSyncedAt = cs.syncedAt;
    }
  }
  if (state.wordsAtLastCheckpoint > state.wordsLearnedTotal) {
    state.wordsAtLastCheckpoint = state.wordsLearnedTotal;
  }
  state.checkpointPromptedAtTotal ??= state.wordsAtLastCheckpoint ?? 0;
  if (state.checkpointPromptedAtTotal > state.wordsLearnedTotal) {
    state.checkpointPromptedAtTotal = state.wordsLearnedTotal;
  }
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
  const y = new Date(Date.now() - DAY_RESET_HOUR * 60 * 60 * 1000 - 86400000);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  state.streak = state.lastActiveDay === yesterday ? state.streak + 1 : 1;
  state.lastActiveDay = today;
}

function noteWordLearnedToday() {
  const today = todayKey();
  if (state.goalDay !== today) {
    state.goalDay = today;
    state.wordsLearnedToday = 0;
    state.goalCelebratedDay = null;
  }
  state.wordsLearnedToday += 1;
  if (
    state.dailyGoal > 0 &&
    state.wordsLearnedToday >= state.dailyGoal &&
    state.goalCelebratedDay !== today
  ) {
    state.goalCelebratedDay = today;
    pushToast({
      label: `Daily goal hit! ${state.dailyGoal} words 🎯 Keep going for bonus XP.`,
      xp: 50,
      coins: 25,
    });
    state.xp += 50;
    state.coins += 25;
    pendingXp += 50;
    pendingCoins += 25;
    scheduleEconomyFlush();
  }
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
  // Queue for server-authoritative reconciliation. Level-up bonus coins are
  // computed server-side as well, so we don't queue them here.
  if (amount > 0) pendingXp += amount;
  if (coins > 0) pendingCoins += coins;
  if (state.level > prevLevel) {
    const coinReward = (state.level - prevLevel) * 100;
    state.coins += coinReward;
    pushToast({ xp: undefined, coins: coinReward, label: `Level ${state.level}!` });
  }
  scheduleEconomyFlush();
}


export function tickActive() {
  const now = Date.now();
  if (state.lastInteractionAt) {
    const gap = Math.min(now - state.lastInteractionAt, MAX_GAP_MS);
    if (gap > 0) state.activeMs += gap;
  }
  state.lastInteractionAt = now;
  while (state.activeMs - state.lastBonusActiveMs >= BONUS_INTERVAL_MS) {
    state.lastBonusActiveMs += BONUS_INTERVAL_MS;
    addXp(BONUS_XP, "Study Time Bonus");
  }
  persist();
}

function blank(): WordState {
  return { mastery: "unknown", seen: 0, correct: 0, wasMissed: false, lastSeenAt: 0 };
}

export function toggleReviewFlag(wordId: string, value?: boolean): boolean {
  const prev: WordState = state.words[wordId] ?? blank();
  const next = typeof value === "boolean" ? value : !prev.reviewFlagged;
  state.words = { ...state.words, [wordId]: { ...prev, reviewFlagged: next } };
  persist();
  return next;
}

export function getLearnedWords(): Array<{ word: VocabWord; ws: WordState }> {
  const out: Array<{ word: VocabWord; ws: WordState }> = [];
  for (const w of VOCAB) {
    const ws = state.words[w.id];
    if (ws && ws.mastery !== "unknown") out.push({ word: w, ws });
  }
  return out;
}

export function markKnown(word: VocabWord): { checkpointDue: boolean } {
  touchStreak();
  tickActive();
  const prev: WordState = state.words[word.id] ?? blank();
  const wasNew = prev.mastery === "unknown";
  // A word counts toward "words learned" exactly once in its lifetime.
  // If we've ever marked it learned/known before (firstLearnedAt set), skip the counter.
  const countsAsNewLearn = wasNew && !prev.firstLearnedAt;
  state.words[word.id] = {
    ...prev,
    mastery: "mastered",
    seen: prev.seen + 1,
    correct: prev.correct + 1,
    lastSeenAt: Date.now(),
    knownAtTotal: prev.knownAtTotal ?? state.wordsLearnedTotal + (countsAsNewLearn ? 1 : 0),
    firstLearnedAt: prev.firstLearnedAt ?? Date.now(),
    reviewFlagged: false,
  };
  state.rootStrength[word.root] = (state.rootStrength[word.root] ?? 0) + 1;
  if (countsAsNewLearn) {
    state.wordsLearnedTotal += 1;
    pendingWordsLearned += 1;
    noteWordLearnedToday();
  }
  checkRootMastery(word.root);
  persist();
  return { checkpointDue: isCheckpointDue() };
}



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

export function markLearned(word: VocabWord): { checkpointDue: boolean } {
  touchStreak();
  tickActive();
  const prev: WordState = state.words[word.id] ?? blank();
  const idx = MASTERY_ORDER.indexOf(prev.mastery);
  const nextMastery = MASTERY_ORDER[Math.min(idx + 1, MASTERY_ORDER.length - 1)];
  const wasMissed = prev.wasMissed;
  const becameMastered = prev.mastery !== "mastered" && nextMastery === "mastered";
  // Only count toward "words learned" the first time this word is ever recorded.
  const countsAsNewLearn = !prev.firstLearnedAt;

  state.words[word.id] = {
    ...prev,
    mastery: nextMastery,
    seen: prev.seen + 1,
    correct: prev.correct + 1,
    lastSeenAt: Date.now(),
    knownAtTotal:
      nextMastery === "mastered" || nextMastery === "familiar"
        ? prev.knownAtTotal ?? state.wordsLearnedTotal + (countsAsNewLearn ? 1 : 0)
        : prev.knownAtTotal,
    firstLearnedAt: prev.firstLearnedAt ?? Date.now(),
    // Stop reinforcing once we hit mastered.
    reviewFlagged: nextMastery === "mastered" ? false : prev.reviewFlagged,
  };
  state.rootStrength[word.root] = (state.rootStrength[word.root] ?? 0) + 1;

  addXp(25, "Learned New Word", 5);
  if (countsAsNewLearn) {
    state.wordsLearnedTotal += 1;
    pendingWordsLearned += 1;
    noteWordLearnedToday();
  }
  if (becameMastered && wasMissed) addXp(50, "Mastered Missed Word", 25);
  checkRootMastery(word.root);
  persist();

  return { checkpointDue: isCheckpointDue() };
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

/** Pool of words for the user's selected exams, unioned and de-duplicated.
 *  Applies each word's exam-specific variant (if any) for the first exam it
 *  matches in the user's selection, so a shared word reads with its most
 *  relevant framing. */
export function examPool(): VocabWord[] {
  // Custom-added words always appear regardless of exam.
  const custom = VOCAB.filter((w) => w.id.startsWith("custom-"));
  const selected = state.selectedExams.length > 0 ? state.selectedExams : ["sat" as const];
  const seen = new Set<string>();
  const out: VocabWord[] = [];
  for (const w of VOCAB_ALL) {
    for (const e of selected) {
      if (wordMatchesExam(w, e)) {
        if (!seen.has(w.id)) {
          seen.add(w.id);
          out.push(applyExamVariant(w, e));
        }
        break;
      }
    }
  }
  for (const c of custom) if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
  return out;
}

// Track recently shown words and cadence for spaced repetition.
// These are intentionally module-local (not persisted) so each session feels fresh.
let recentlyShown: string[] = [];
let shownCounter = 0;
const RECENT_BUFFER = 40;
const REINFORCE_EVERY = 6;

function rememberShown(id: string) {
  recentlyShown = [id, ...recentlyShown.filter((x) => x !== id)].slice(0, RECENT_BUFFER);
  shownCounter += 1;
}

export function nextWord(exclude?: string | string[]): VocabWord {
  const pool = examPool();
  const total = state.wordsLearnedTotal;
  const excludeIds = new Set<string>(
    Array.isArray(exclude) ? exclude : exclude ? [exclude] : [],
  );
  // Also avoid the most recently shown words so the feed doesn't repeat tightly.
  recentlyShown.slice(0, RECENT_BUFFER).forEach((id) => excludeIds.add(id));

  // Lightweight spaced repetition: every 3rd pick, surface a user-flagged
  // "review again" word until it reaches mastered.
  const dueForReview = shownCounter > 0 && shownCounter % 3 === 0;
  if (dueForReview) {
    const reviewPool = pool
      .filter((w) => !excludeIds.has(w.id))
      .filter((w) => {
        const ws = state.words[w.id];
        return ws?.reviewFlagged && ws.mastery !== "mastered";
      })
      .sort((a, b) => (state.words[a.id]?.lastSeenAt ?? 0) - (state.words[b.id]?.lastSeenAt ?? 0));
    if (reviewPool.length > 0) {
      const pick = reviewPool[0];
      rememberShown(pick.id);
      return pick;
    }
  }

  // Every Nth pick, force a reinforcement of an unlearned (missed/learning) word
  // so users see previously-missed vocab on a predictable cadence.
  const dueForReinforce = shownCounter > 0 && shownCounter % REINFORCE_EVERY === 0;
  if (dueForReinforce) {
    const learningPool = pool
      .filter((w) => !excludeIds.has(w.id))
      .filter((w) => {
        const m = state.words[w.id]?.mastery;
        return m === "learning" || m === "practicing";
      })
      .sort((a, b) => (state.words[a.id]?.lastSeenAt ?? 0) - (state.words[b.id]?.lastSeenAt ?? 0));
    if (learningPool.length > 0) {
      const pick = learningPool[0];
      rememberShown(pick.id);
      return pick;
    }
  }

  const candidates = pool.filter((w) => {
    if (excludeIds.has(w.id)) return false;
    const ws = state.words[w.id];
    const m = ws?.mastery;
    if (m !== "mastered" && m !== "familiar") return true;
    // Refresher eligibility: only after enough new words have passed.
    const since = total - (ws?.knownAtTotal ?? total);
    if (since < REFRESHER_COOLDOWN) return false;
    return Math.random() < 0.08;
  });
  // Fallback: drop the recency exclusion (but keep caller-supplied exclude) so the feed never dies.
  const callerExclude = new Set<string>(Array.isArray(exclude) ? exclude : exclude ? [exclude] : []);
  const fallback = pool.filter((w) => !callerExclude.has(w.id));
  const source = candidates.length > 0 ? candidates : fallback.length > 0 ? fallback : pool;
  const scored = source.map((w) => {
    const ws = state.words[w.id];
    const masteryWeight = ws
      ? { unknown: 5, learning: 6, practicing: 4, familiar: 1.2, mastered: 0.6 }[ws.mastery]
      : 5;
    const rootWeight = Math.max(1, 4 - (state.rootStrength[w.root] ?? 0));
    const recencyPenalty = ws && Date.now() - ws.lastSeenAt < 30_000 ? 0.1 : 1;
    return { w, score: masteryWeight * rootWeight * recencyPenalty * Math.random() };
  });
  scored.sort((a, b) => b.score - a.score);
  const pick = scored[0]?.w ?? pool[0] ?? VOCAB[0];
  rememberShown(pick.id);
  return pick;
}


export function snoozeCheckpoint() {
  // User dismissed / skipped the checkpoint. The past checkpoint is cancelled —
  // counting restarts from now toward the NEXT interval.
  const hadSavedSession = !!loadCheckpointSession();
  state = {
    ...state,
    wordsAtLastCheckpoint: Math.max(0, state.wordsLearnedTotal),
    checkpointPromptedAtTotal: Math.max(0, state.wordsLearnedTotal),
  };
  // Drop any half-finished saved session so it doesn't keep offering "Resume".
  clearCheckpointSession();
  pushToast({
    label: hadSavedSession
      ? `Past checkpoint cancelled. We'll prompt again after ${state.checkpointInterval} more new words.`
      : `Checkpoint skipped. We'll check in again after ${state.checkpointInterval} more new words.`,
  });
  persist();
}



export function setExam(exam: ExamType) {
  state.exam = exam;
  persist();
}
export function setCheckpointInterval(n: number) {
  const clamped = Math.max(5, Math.min(100, Math.round(n)));
  state = {
    ...state,
    checkpointInterval: clamped,
    // Changing cadence starts a fresh cycle, so "every 5 words" means the
    // next 5 NEW words from this moment.
    wordsAtLastCheckpoint: Math.max(0, state.wordsLearnedTotal),
    checkpointPromptedAtTotal: Math.max(0, state.wordsLearnedTotal),
  };
  pushToast({ label: `Checkpoint reminder set: every ${clamped} new words.` });
  persist();
}

export function setDailyGoal(n: number) {
  const clamped = Math.max(1, Math.min(200, Math.round(n)));
  state = { ...state, dailyGoal: clamped, goalCelebratedDay: null };
  persist();
}

export function dailyGoalProgress() {
  const today = todayKey();
  const learned = state.goalDay === today ? state.wordsLearnedToday : 0;
  return { learned, goal: state.dailyGoal, reached: learned >= state.dailyGoal };
}

export function isCheckpointDue() {
  const since = state.wordsLearnedTotal - state.wordsAtLastCheckpoint;
  return since > 0 && since >= state.checkpointInterval;
}

export function shouldShowCheckpointPrompt() {
  const dueAt = state.wordsAtLastCheckpoint + state.checkpointInterval;
  const learnedSincePrompt = state.wordsLearnedTotal - state.checkpointPromptedAtTotal;
  return isCheckpointDue() && (
    state.checkpointPromptedAtTotal < dueAt ||
    learnedSincePrompt >= state.checkpointInterval
  );
}

export function markCheckpointPromptShown() {
  if (!isCheckpointDue()) return;
  state = {
    ...state,
    checkpointPromptedAtTotal: Math.max(state.checkpointPromptedAtTotal, state.wordsLearnedTotal),
  };
  persist();
}

/** Pick N words for a checkpoint — prioritises words the user most RECENTLY
 *  learned (so today's session gets quizzed first), then falls back to older
 *  learned-but-not-mastered words. Ordering: newest firstLearnedAt → lowest mastery → recent lastSeenAt. */
export function pickCheckpointWords(count: number): VocabWord[] {
  const pool = examPool();
  const learned = pool
    .filter((w) => {
      const m = state.words[w.id]?.mastery;
      return m && m !== "unknown";
    })
    .sort((a, b) => {
      const wa = state.words[a.id];
      const wb = state.words[b.id];
      // Newest learned first.
      const fa = wa.firstLearnedAt ?? wa.lastSeenAt ?? 0;
      const fb = wb.firstLearnedAt ?? wb.lastSeenAt ?? 0;
      if (fb !== fa) return fb - fa;
      // Then lowest mastery first.
      return MASTERY_ORDER.indexOf(wa.mastery) - MASTERY_ORDER.indexOf(wb.mastery);
    });
  return learned.slice(0, count);
}


/** Record per-word mastery score (0-100) from a checkpoint test. */
export function applyMasteryScore(wordId: string, score: number) {
  const prev: WordState = state.words[wordId] ?? blank();
  let mastery: Mastery = prev.mastery;
  if (score >= 91) mastery = "mastered";
  else if (score >= 76) mastery = "familiar";
  else if (score >= 51) mastery = "practicing";
  else if (score >= 26) mastery = "learning";
  state.words[wordId] = { ...prev, mastery, masteryScore: score, lastSeenAt: Date.now() };
}

export function completeCheckpoint(scores: Record<string, number>, perfect: boolean) {
  state = {
    ...state,
    wordsAtLastCheckpoint: Math.max(0, state.wordsLearnedTotal),
    checkpointPromptedAtTotal: Math.max(0, state.wordsLearnedTotal),
    checkpointsPassed: state.checkpointsPassed + 1,
    perfectCheckpoints: perfect ? state.perfectCheckpoints + 1 : state.perfectCheckpoints,
  };
  addXp(100, "Checkpoint Passed", 25);
  if (perfect) addXp(250, "Perfect Checkpoint!", 75);
  // milestone rewards
  const masteredCount = Object.values(state.words).filter((w) => w.mastery === "mastered").length;
  if (masteredCount >= 10 && masteredCount - Object.keys(scores).length < 10) {
    addXp(0, "10 Words Mastered", 100);
  }
  if (masteredCount >= 25 && masteredCount - Object.keys(scores).length < 25) {
    addXp(0, "25 Words Mastered — Cosmetic Unlocked", 250);
  }
  if (masteredCount >= 100 && masteredCount - Object.keys(scores).length < 100) {
    addXp(0, "100 Words Mastered — Avatar Item!", 1000);
  }
  persist();
}

/* ---------- Shop / avatar ---------- */

export async function purchaseItem(itemId: string, level: number, cost: number): Promise<{ ok: boolean; reason?: string }> {
  if (state.ownedItems.includes(itemId)) return { ok: false, reason: "Already owned" };
  // Optimistic client-side guard for UX only — server is the source of truth.
  if (state.level < level) return { ok: false, reason: `Reach level ${level} first` };
  if (state.coins < cost) return { ok: false, reason: "Not enough coins" };

  try {
    const { purchaseShopItem } = await import("@/lib/shop.functions");
    const res = await purchaseShopItem({ data: { itemId } });
    if (!res.ok) return { ok: false, reason: res.reason };
    state = {
      ...state,
      coins: res.coins,
      ownedItems: res.ownedItems,
    };
    pushToast({ label: "Item unlocked!" });
    persist();
    return { ok: true };
  } catch (e) {
    console.warn("purchase failed", e);
    return { ok: false, reason: "Network error" };
  }
}


export function setAvatar(avatar: AvatarConfig) {
  state = { ...state, avatar: { ...avatar } };
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

// ---------- Checkpoint session resume ----------
function ckptKey(userId: string) { return `lexiq:ckpt-session::${userId}`; }
export function saveCheckpointSession(data: unknown) {
  if (typeof window === "undefined" || !state.userId) return;
  try { localStorage.setItem(ckptKey(state.userId), JSON.stringify(data)); } catch {}
}
export function loadCheckpointSession<T = unknown>(): T | null {
  if (typeof window === "undefined" || !state.userId) return null;
  try {
    const raw = localStorage.getItem(ckptKey(state.userId));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}
export function clearCheckpointSession() {
  if (typeof window === "undefined" || !state.userId) return;
  try { localStorage.removeItem(ckptKey(state.userId)); } catch {}
}

/** Words the user is struggling with (low mastery score or stuck in learning/practicing). */
export function getStruggleWords(limit = 12): VocabWord[] {
  const items: { word: VocabWord; score: number }[] = [];
  for (const w of VOCAB) {
    const ws = state.words[w.id];
    if (!ws || ws.mastery === "unknown") continue;
    const score = typeof ws.masteryScore === "number"
      ? ws.masteryScore
      : ws.mastery === "mastered" ? 95 : ws.mastery === "familiar" ? 80 : ws.mastery === "practicing" ? 55 : 30;
    if (score < 76) items.push({ word: w, score });
  }
  items.sort((a, b) => a.score - b.score);
  return items.slice(0, limit).map((i) => i.word);
}
