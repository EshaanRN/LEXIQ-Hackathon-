/** Interest-tuned example sentences.
 *  The dataset is large, so it is loaded lazily as its own chunk the first time
 *  a word card needs it. */

export const INTEREST_KEYS = [
  "reading", "movies", "gaming", "music", "sports", "art",
  "science", "tech", "travel", "food", "fashion", "history",
] as const;

export type InterestKey = (typeof INTEREST_KEYS)[number];

export const INTEREST_LABELS: Record<InterestKey, string> = {
  reading: "📚 Reading",
  movies: "🎬 Movies",
  gaming: "🎮 Gaming",
  music: "🎵 Music",
  sports: "⚽ Sports",
  art: "🎨 Art",
  science: "🔬 Science",
  tech: "💻 Tech",
  travel: "✈️ Travel",
  food: "🍕 Food",
  fashion: "👗 Fashion",
  history: "🏛️ History",
};

const LS_KEY = "lexiq:interests:v1";

/** Map the emoji labels used in onboarding to canonical keys. */
export function labelsToKeys(labels: string[]): InterestKey[] {
  const out: InterestKey[] = [];
  for (const raw of labels) {
    const l = raw.toLowerCase();
    for (const k of INTEREST_KEYS) {
      if (l.includes(k) && !out.includes(k)) out.push(k);
    }
  }
  return out;
}

export function saveInterests(labels: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(labelsToKeys(labels)));
  } catch { /* quota */ }
}

export function getInterests(): InterestKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((k): k is InterestKey => INTEREST_KEYS.includes(k)) : [];
  } catch {
    return [];
  }
}

type Bank = Record<string, Partial<Record<InterestKey, string>>>;

let bank: Bank | null = null;
let loading: Promise<Bank> | null = null;

export function loadInterestExamples(): Promise<Bank> {
  if (bank) return Promise.resolve(bank);
  if (!loading) {
    loading = import("@/data/interest-examples.json")
      .then((m) => {
        bank = (m.default ?? m) as Bank;
        return bank;
      })
      .catch(() => ({}));
  }
  return loading;
}

/** Examples for a word, ordered so the user's own interests come first. */
export function examplesFor(
  wordId: string,
  interests: InterestKey[],
  b: Bank | null = bank,
): { key: InterestKey; label: string; sentence: string }[] {
  const entry = b?.[wordId];
  if (!entry) return [];
  const preferred = interests.length ? interests : INTEREST_KEYS.slice(0, 4);
  const order = [...preferred, ...INTEREST_KEYS.filter((k) => !preferred.includes(k))];
  return order
    .filter((k) => !!entry[k])
    .map((k) => ({ key: k, label: INTEREST_LABELS[k], sentence: entry[k] as string }));
}
