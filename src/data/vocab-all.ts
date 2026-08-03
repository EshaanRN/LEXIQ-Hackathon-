import { VOCAB, type VocabWord, type ExamType } from "./vocab";

/** Merged pool of every exam's words. Custom words are appended at runtime by
 *  `src/lib/custom-vocab.ts`. This is the single source of truth for the swipe
 *  feed once exams beyond SAT/ACT are seeded. */
export const VOCAB_ALL: VocabWord[] = [...VOCAB];

/** Apply an exam-specific variant on top of a word, if the word declares one for
 *  the active exam. Returns a shallow copy so callers can safely spread. */
export function applyExamVariant(w: VocabWord, exam: ExamType): VocabWord {
  if (exam === "both") return w;
  const v = w.examVariants?.[exam];
  if (!v) return w;
  return {
    ...w,
    definition: v.definition ?? w.definition,
    studentDefinition: v.studentDefinition ?? w.studentDefinition,
    satContext: v.satContext ?? w.satContext,
    example: v.example ?? w.example,
  };
}

/** True when a word belongs in the active exam's pool. */
export function wordMatchesExam(w: VocabWord, exam: ExamType): boolean {
  if (exam === "both") return true;
  if (w.exam === exam) return true;
  // SAT/ACT "both" tag stays cross-listed on those two exams only.
  if (w.exam === "both" && (exam === "sat" || exam === "act")) return true;
  // Words with explicit variants are always eligible for those exams.
  if (w.examVariants && w.examVariants[exam]) return true;
  return false;
}

export const EXAM_META: Record<Exclude<ExamType, "both">, { label: string; short: string; blurb: string }> = {
  sat:   { label: "SAT",   short: "SAT",   blurb: "College Board vocab, evidence words, academic register." },
  act:   { label: "ACT",   short: "ACT",   blurb: "Reading, Science & English section vocab." },
  gre:   { label: "GRE",   short: "GRE",   blurb: "Advanced academic vocab — nuance, tone, register." },
  lsat:  { label: "LSAT",  short: "LSAT",  blurb: "Legal terminology & logical-reasoning language." },
  mcat:  { label: "MCAT",  short: "MCAT",  blurb: "Bio, biochem, chem, psych/soc terminology." },
  toefl: { label: "TOEFL", short: "TOEFL", blurb: "Academic English for lectures & passages." },
  ielts: { label: "IELTS", short: "IELTS", blurb: "Band 7–9 Task 2 vocab, formal alternatives." },
};

export const EXAM_ORDER: Exclude<ExamType, "both">[] = ["sat", "act"];

/** Count of eligible words for each exam, for display in pickers. */
export function examCounts(): Record<Exclude<ExamType, "both">, number> {
  const out = { sat: 0, act: 0, gre: 0, lsat: 0, mcat: 0, toefl: 0, ielts: 0 };
  for (const w of VOCAB_ALL) {
    for (const e of EXAM_ORDER) {
      if (wordMatchesExam(w, e)) out[e] += 1;
    }
  }
  return out;
}
