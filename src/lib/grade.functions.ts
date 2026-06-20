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
      const word = data.word.toLowerCase();
      const defOk = data.definitionAnswer.length > 6;
      const sentOk = data.sentenceAnswer.toLowerCase().includes(word) && data.sentenceAnswer.length > word.length + 8;
      const pronOk = data.mode === "typing"
        ? true
        : (data.pronunciationTranscript ?? "").toLowerCase().includes(word.slice(0, Math.min(5, word.length)));
      const def = defOk ? 70 : 30;
      const ctx = sentOk ? 75 : 35;
      const pron = data.mode === "typing" ? 100 : pronOk ? 80 : 40;
      const total = Math.round(pron * 0.2 + def * 0.4 + ctx * 0.4);
      return {
        pronunciationScore: pron,
        definitionScore: def,
        contextScore: ctx,
        totalScore: total,
        feedback: "Couldn't reach the AI grader; using a basic check. Try again in a moment for a full grade.",
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
  const w = d.word.toLowerCase();
  const a = d.answer.toLowerCase().trim();
  if (d.field === "pronunciation") {
    const ok = a.includes(w) || (a.length > 2 && w.startsWith(a.slice(0, Math.min(4, a.length))));
    const score = ok ? 85 : 35;
    return { score, correct: ok, feedback: ok ? "Sounds right!" : `Try again — aim for "${d.word}".` };
  }
  if (d.field === "definition") {
    const ok = a.length > 6;
    return { score: ok ? 70 : 30, correct: ok, feedback: ok ? "Looks reasonable." : "Add a bit more detail." };
  }
  const ok = a.includes(w) && a.length > w.length + 8;
  return { score: ok ? 75 : 35, correct: ok, feedback: ok ? "Nice usage." : `Try a sentence that actually uses "${d.word}".` };
}
