import { useEffect, useState, useSyncExternalStore } from "react";
import { VOCAB, type VocabWord, type ExamType } from "@/data/vocab";
import { supabase } from "@/integrations/supabase/client";
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
  checkpointInterval: number;
  /** Total NEW words the user has learned (used to trigger checkpoint prompts) */
  wordsLearnedTotal: number;
  /** Count snapshot at last successful checkpoint */
  wordsAtLastCheckpoint: number;
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
    exam: "sat",
    checkpointInterval: 20,
    wordsLearnedTotal: 0,
    wordsAtLastCheckpoint: 0,
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
    // NOTE: xp, coins, level, words_learned_total, and owned_items are
    // server-authoritative — they're only mutated by economy/shop server fns.
    // Syncing them from client state would let a tampered localStorage
    // forge balances.
    await supabase
      .from("profiles")
      .update({
        avatar: state.avatar as never,
        equipped: state.avatar as never,
        exam: state.exam,
        checkpoint_interval: state.checkpointInterval,
      })
      .eq("id", state.userId);
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
      xp: res.xp,
      coins: res.coins,
      level: res.level,
      wordsLearnedTotal: res.wordsLearnedTotal,
      rank: rankFor(res.xp),
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

export function markKnown(word: VocabWord): { checkpointDue: boolean } {
  touchStreak();
  tickActive();
  const prev: WordState = state.words[word.id] ?? blank();
  const wasNew = prev.mastery === "unknown";
  state.words[word.id] = {
    ...prev,
    mastery: "mastered",
    seen: prev.seen + 1,
    correct: prev.correct + 1,
    lastSeenAt: Date.now(),
    knownAtTotal: prev.knownAtTotal ?? state.wordsLearnedTotal + (wasNew ? 1 : 0),
  };
  state.rootStrength[word.root] = (state.rootStrength[word.root] ?? 0) + 1;
  if (wasNew) {
    state.wordsLearnedTotal += 1;
    pendingWordsLearned += 1;
    noteWordLearnedToday();
  }
  checkRootMastery(word.root);
  persist();
  const since = state.wordsLearnedTotal - state.wordsAtLastCheckpoint;
  return { checkpointDue: since > 0 && since >= state.checkpointInterval };
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
  const wasNew = prev.mastery === "unknown" || prev.mastery === "learning";

  state.words[word.id] = {
    ...prev,
    mastery: nextMastery,
    seen: prev.seen + 1,
    correct: prev.correct + 1,
    lastSeenAt: Date.now(),
    knownAtTotal:
      nextMastery === "mastered" || nextMastery === "familiar"
        ? prev.knownAtTotal ?? state.wordsLearnedTotal + (wasNew ? 1 : 0)
        : prev.knownAtTotal,
  };
  state.rootStrength[word.root] = (state.rootStrength[word.root] ?? 0) + 1;

  addXp(25, "Learned New Word", 5);
  if (wasNew) {
    state.wordsLearnedTotal += 1;
    pendingWordsLearned += 1;
    noteWordLearnedToday();
  }
  if (becameMastered && wasMissed) addXp(50, "Mastered Missed Word", 25);
  checkRootMastery(word.root);
  persist();

  const since = state.wordsLearnedTotal - state.wordsAtLastCheckpoint;
  return { checkpointDue: since > 0 && since >= state.checkpointInterval };
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

/** Pool of words filtered by current exam preference */
export function examPool(): VocabWord[] {
  const e = state.exam;
  return VOCAB.filter((w) => {
    if (e === "both") return true;
    return w.exam === e || w.exam === "both";
  });
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
  // Push the next prompt one full interval ahead so the user isn't nagged
  // word-after-word once they say "Later".
  state = { ...state, wordsAtLastCheckpoint: state.wordsLearnedTotal };
  persist();
}



export function setExam(exam: ExamType) {
  state.exam = exam;
  persist();
}
export function setCheckpointInterval(n: number) {
  state = { ...state, checkpointInterval: n };
  notify();
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

/** Pick N words for a checkpoint — words the user has learned but not yet
 * fully mastered, preferring earliest "learning"/"practicing"/"familiar". */
export function pickCheckpointWords(count: number): VocabWord[] {
  const pool = examPool();
  const learned = pool
    .filter((w) => {
      const m = state.words[w.id]?.mastery;
      return m && m !== "unknown";
    })
    .sort((a, b) => {
      const ma = MASTERY_ORDER.indexOf(state.words[a.id].mastery);
      const mb = MASTERY_ORDER.indexOf(state.words[b.id].mastery);
      return ma - mb;
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
    wordsAtLastCheckpoint: state.wordsLearnedTotal,
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
