import { VOCAB, type VocabWord } from "@/data/vocab";

const LS_KEY = "lexiq:custom-vocab:v1";

export interface CustomVocabWord extends VocabWord {
  custom: true;
  createdAt: number;
}

function safeParse(): CustomVocabWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list: CustomVocabWord[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { /* quota */ }
}

let loaded = false;
export function loadCustomVocab() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const list = safeParse();
  const seen = new Set(VOCAB.map((w) => w.id));
  for (const w of list) {
    if (!seen.has(w.id)) {
      VOCAB.push(w);
      seen.add(w.id);
    }
  }
}

export function listCustomVocab(): CustomVocabWord[] {
  return safeParse();
}

/** Build a VocabWord from an AI-generated payload and persist it. */
export function addCustomWord(payload: {
  word: string;
  partOfSpeech: string;
  difficulty: "easy" | "medium" | "hard";
  definition: string;
  studentDefinition: string;
  satContext: string;
  root: string;
  rootMeaning: string;
  example: string;
  synonyms: string[];
}): CustomVocabWord {
  const idBase = payload.word.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  let id = `custom-${idBase}`;
  const existing = new Set(VOCAB.map((w) => w.id));
  let n = 2;
  while (existing.has(id)) { id = `custom-${idBase}-${n++}`; }

  const entry: CustomVocabWord = {
    id,
    word: payload.word.trim(),
    pronunciation: "",
    partOfSpeech: payload.partOfSpeech,
    difficulty: payload.difficulty,
    frequency: 3,
    exam: "both",
    definition: payload.definition,
    studentDefinition: payload.studentDefinition,
    satContext: payload.satContext,
    root: payload.root,
    rootMeaning: payload.rootMeaning,
    mnemonic: `Picture ${payload.word} vividly: ${payload.example}`,
    example: payload.example,
    synonyms: payload.synonyms.slice(0, 5),
    custom: true,
    createdAt: Date.now(),
  };

  const list = safeParse();
  list.push(entry);
  write(list);
  VOCAB.push(entry);
  return entry;
}

export function removeCustomWord(id: string) {
  const list = safeParse().filter((w) => w.id !== id);
  write(list);
  const idx = VOCAB.findIndex((w) => w.id === id);
  if (idx >= 0) VOCAB.splice(idx, 1);
}
