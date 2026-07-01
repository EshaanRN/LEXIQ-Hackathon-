import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


const GradeInput = z.object({
  word: z.string().min(1).max(60),
  definition: z.string().min(1).max(500),
  partOfSpeech: z.string().max(60),
  mode: z.enum(["typing", "speaking"]),
  pronunciationTranscript: z.string().max(200).optional(),
  definitionAnswer: z.string().max(800),
  sentenceAnswer: z.string().max(800),
});

const GradeSchema = z.object({
  pronunciationScore: z.number().min(0).max(100),
  definitionScore: z.number().min(0).max(100),
  contextScore: z.number().min(0).max(100),
  totalScore: z.number().min(0).max(100),
  feedback: z.string().max(400),
});

export const gradeCheckpointAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GradeInput.parse(input))

  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const sys = `You are an SAT/ACT vocabulary tutor grading a student's mastery of a single word.
Be encouraging but accurate. Score on a 0-100 scale per dimension.
- pronunciationScore: how close the pronunciation transcript is to the target word.
  If mode is "typing", set pronunciationScore = 100 (skipped).
- definitionScore: how accurately the student's definition matches the real meaning.
  Allow synonyms and paraphrase; deduct for missing nuance or wrong meaning.
- contextScore: does the student's sentence USE the word correctly in meaningful context?
  Reward original sentences that show the meaning; penalize copy of the definition or generic "I like X" sentences.
- totalScore: weighted average ((pronunciation*0.2)+(definition*0.4)+(context*0.4)) rounded.
- feedback: 1-2 sentences, friendly, specific, ≤300 chars.`;

    const prompt = `Target word: "${data.word}" (${data.partOfSpeech})
Correct definition: ${data.definition}

Student mode: ${data.mode}
${data.mode === "speaking" ? `Student pronunciation transcript: "${data.pronunciationTranscript ?? ""}"` : "Pronunciation: skipped (typing mode)"}
Student definition answer: "${data.definitionAnswer}"
Student sentence answer: "${data.sentenceAnswer}"

Grade strictly but fairly. Return only the JSON object.`;

    try {
      const { object } = await generateObject({
        model: gateway("google/gemini-3-flash-preview"),
        schema: GradeSchema,
        system: sys,
        prompt,
      });
      return object;
    } catch (e) {
      console.error("grade error", e);
      const pron = data.mode === "typing"
        ? 100
        : scorePronunciation(data.word, data.pronunciationTranscript ?? "");
      const def = scoreDefinition(data.word, data.definition, data.definitionAnswer);
      const ctx = scoreSentence(data.word, data.definition, data.sentenceAnswer);
      const total = Math.round(pron * 0.2 + def * 0.4 + ctx * 0.4);
      return {
        pronunciationScore: pron,
        definitionScore: def,
        contextScore: ctx,
        totalScore: total,
        feedback: buildFeedback(pron, def, ctx, data.mode),
      };
    }
  });


// ---- Instant per-field grading (used by speaking mode for live feedback) ----

const FieldInput = z.object({
  word: z.string().min(1).max(60),
  definition: z.string().min(1).max(500),
  partOfSpeech: z.string().max(60),
  field: z.enum(["pronunciation", "definition", "sentence"]),
  answer: z.string().min(1).max(800),
});

const FieldSchema = z.object({
  score: z.number().min(0).max(100),
  correct: z.boolean(),
  feedback: z.string().max(220),
});

export const gradeAnswerField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => FieldInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    // Fast heuristic fallback first so the UI never stalls.
    const heur = quickField(data);

    const sys = `You grade a single dimension of a vocabulary answer. Return JSON only.
score: 0-100. correct: true if score >= 70. feedback: <= 1 short sentence, encouraging and specific.
Dimension semantics:
- pronunciation: compare a speech-to-text transcript to the target word. Allow homophone-like near matches.
- definition: how accurately the answer captures the meaning. Allow paraphrase/synonyms.
- sentence: does the sentence use the word correctly in meaningful context. Penalize copying the definition.`;

    const prompt = `Word: "${data.word}" (${data.partOfSpeech})
Correct meaning: ${data.definition}
Dimension: ${data.field}
Student answer: "${data.answer}"`;

    try {
      const { object } = await generateObject({
        model: gateway("google/gemini-3-flash-preview"),
        schema: FieldSchema,
        system: sys,
        prompt,
      });
      return object;
    } catch (e) {
      console.warn("gradeAnswerField fallback", e);
      return heur;
    }
  });

function quickField(d: { word: string; definition: string; field: "pronunciation" | "definition" | "sentence"; answer: string }) {
  if (d.field === "pronunciation") {
    const score = scorePronunciation(d.word, d.answer);
    const correct = score >= 70;
    return { score, correct, feedback: correct ? "Sounds right!" : `Try again — aim for "${d.word}".` };
  }
  if (d.field === "definition") {
    const score = scoreDefinition(d.word, d.definition, d.answer);
    const correct = score >= 70;
    return { score, correct, feedback: correct ? "Nailed the meaning!" : "Try to capture the core meaning more precisely." };
  }
  const score = scoreSentence(d.word, d.definition, d.answer);
  const correct = score >= 70;
  return { score, correct, feedback: correct ? "Nice usage." : `Use "${d.word}" in a sentence that shows its meaning.` };
}

// ---------- Heuristic scoring helpers (used when the AI grader is unavailable) ----------

const STOP = new Set([
  "a","an","the","and","or","but","of","to","in","on","for","with","by","is","are","was","were","be","been","being",
  "it","its","this","that","these","those","as","at","from","into","than","then","so","if","not","no","do","does",
  "did","has","have","had","you","your","i","we","they","he","she","them","his","her","their","our","my","me",
  "who","what","when","where","which","how","why","can","could","should","would","will","just","very","really",
  "someone","something","person","thing","things","people","who's","who","one","who","who",
]);

function tokenize(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function contentTokens(s: string): string[] {
  return tokenize(s).filter((t) => t.length > 2 && !STOP.has(t));
}
function stem(t: string): string {
  return t.replace(/(ing|edly|ed|ly|es|s)$/i, "");
}

// Levenshtein distance (small, fine for short words)
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

function scorePronunciation(target: string, transcript: string): number {
  const t = (transcript || "").toLowerCase().trim();
  const w = target.toLowerCase().trim();
  if (!t) return 0;
  // Best token match against target word
  const toks = tokenize(t);
  if (toks.length === 0) return 0;
  let best = Infinity;
  for (const tok of toks) best = Math.min(best, editDistance(tok, w));
  // Also check full-string similarity for phrases like "the word is X"
  best = Math.min(best, editDistance(t.replace(/\s+/g, ""), w));
  const ratio = 1 - best / Math.max(w.length, 3);
  // Map ratio -> score
  if (ratio >= 0.95) return 100;
  if (ratio >= 0.85) return 92;
  if (ratio >= 0.7) return 82;
  if (ratio >= 0.55) return 68;
  if (ratio >= 0.4) return 50;
  if (ratio >= 0.25) return 35;
  return 15;
}

function scoreDefinition(word: string, correctDef: string, answer: string): number {
  const ans = (answer || "").trim();
  if (ans.length < 3) return 0;
  const ansTok = contentTokens(ans).map(stem);
  const defTok = contentTokens(correctDef).map(stem);
  if (defTok.length === 0) return ans.length > 6 ? 60 : 30;
  const defSet = new Set(defTok);
  const ansSet = new Set(ansTok);
  let overlap = 0;
  for (const t of ansSet) if (defSet.has(t)) overlap++;
  const recall = overlap / defSet.size; // how much of the true meaning captured
  const precision = ansTok.length > 0 ? overlap / ansSet.size : 0;
  // Penalize just echoing the word itself
  const wordStem = stem(word.toLowerCase());
  const onlyWord = ansTok.every((t) => t === wordStem);
  if (onlyWord) return 10;
  // Length sanity
  const lenBonus = Math.min(1, ansTok.length / 4);
  const base = recall * 0.7 + precision * 0.3;
  const score = Math.round((base * 0.85 + lenBonus * 0.15) * 100);
  // Give partial credit when there's at least one strong content-word overlap
  if (score < 40 && overlap >= 1 && ansTok.length >= 3) return 55;
  return Math.max(0, Math.min(100, score));
}

function scoreSentence(word: string, correctDef: string, answer: string): number {
  const ans = (answer || "").trim();
  if (ans.length < 4) return 0;
  const w = word.toLowerCase();
  const wStem = stem(w);
  const tokens = tokenize(ans);
  const usesWord = tokens.some((t) => t === w || stem(t) === wStem || t.startsWith(wStem));
  if (!usesWord) return 20;
  // Word count (excluding the target word itself)
  const otherContent = contentTokens(ans).filter((t) => stem(t) !== wStem);
  if (otherContent.length < 2) return 40; // too bare, e.g., "I am obsolete."
  // Discourage copying the definition verbatim
  const defNorm = correctDef.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  const ansNorm = ans.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  const copiedDef = defNorm.length > 12 && ansNorm.includes(defNorm.slice(0, Math.min(defNorm.length, 30)));
  if (copiedDef) return 45;
  // Reward showing meaning: overlap with definition content tokens
  const defTok = new Set(contentTokens(correctDef).map(stem));
  const ansStems = new Set(otherContent.map(stem));
  let overlap = 0;
  for (const t of ansStems) if (defTok.has(t)) overlap++;
  const meaningSignal = defTok.size > 0 ? Math.min(1, overlap / Math.min(3, defTok.size)) : 0.5;
  const lenSignal = Math.min(1, otherContent.length / 6);
  const score = Math.round(60 + meaningSignal * 25 + lenSignal * 15);
  return Math.max(0, Math.min(100, score));
}

function buildFeedback(pron: number, def: number, ctx: number, mode: "typing" | "speaking"): string {
  const parts: string[] = [];
  if (mode === "speaking") parts.push(pron >= 80 ? "Pronunciation solid" : pron >= 55 ? "Pronunciation close" : "Pronunciation needs work");
  parts.push(def >= 80 ? "definition on point" : def >= 60 ? "definition mostly there" : "definition needs more detail");
  parts.push(ctx >= 80 ? "sentence shows the meaning" : ctx >= 60 ? "sentence uses the word" : "sentence doesn't show the meaning");
  return parts.join(" · ") + ".";
}

