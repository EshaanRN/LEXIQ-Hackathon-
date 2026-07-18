import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { VOCAB, type VocabWord } from "@/data/vocab";

const QuestionSchema = z.object({
  word: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()).length(4),
  correctIndex: z.number().min(0).max(3),
  explanation: z.string(),
});
const QuizSchema = z.object({ questions: z.array(QuestionSchema).min(1).max(20) });

type Question = z.infer<typeof QuestionSchema>;

// ---------- Heuristic fallback (used if the AI gateway is unavailable) ----------

function findVocab(word: string): VocabWord | undefined {
  const w = word.trim().toLowerCase();
  return VOCAB.find((v) => v.word.toLowerCase() === w);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build an SAT-style "as used in the sentence, X most nearly means…" question from a VOCAB entry. */
function heuristicQuestionFor(v: VocabWord): Question | null {
  const correct = v.definition || v.studentDefinition;
  if (!correct) return null;
  // Pull 3 distractors — other VOCAB definitions, different word, roughly similar length.
  const pool = VOCAB.filter(
    (o) => o.id !== v.id && o.definition && Math.abs(o.definition.length - correct.length) < 60
  );
  const distractors = shuffle(pool).slice(0, 3).map((o) => o.definition);
  if (distractors.length < 3) return null;
  const choices = shuffle([correct, ...distractors]);
  const correctIndex = choices.indexOf(correct);
  const passage = v.satContext || v.example || `The word "${v.word}" was used in an academic passage.`;
  return {
    word: v.word,
    prompt: `${passage}\n\nAs used in the sentence above, "${v.word}" most nearly means:`,
    choices,
    correctIndex,
    explanation: `"${v.word}" means: ${correct}${v.synonyms?.length ? ` (e.g., ${v.synonyms.slice(0, 3).join(", ")}).` : "."}`,
  };
}

function heuristicQuiz(words: string[], count: number): { questions: Question[] } {
  const qs: Question[] = [];
  for (const w of words) {
    if (qs.length >= count) break;
    const v = findVocab(w);
    if (!v) continue;
    const q = heuristicQuestionFor(v);
    if (q) qs.push(q);
  }
  // If we still have room, top up with random VOCAB entries so the user gets a full quiz.
  if (qs.length < count) {
    const used = new Set(qs.map((q) => q.word.toLowerCase()));
    for (const v of shuffle(VOCAB.filter((v) => v.exam !== "act"))) {
      if (qs.length >= count) break;
      if (used.has(v.word.toLowerCase())) continue;
      const q = heuristicQuestionFor(v);
      if (q) {
        qs.push(q);
        used.add(v.word.toLowerCase());
      }
    }
  }
  return { questions: qs };
}

// ---------- Custom test (Premium) ----------

const CustomInput = z.object({
  words: z.array(z.string().min(1).max(60)).min(1).max(25),
  count: z.number().min(1).max(20).default(10),
});

export const generateCustomQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CustomInput.parse(input))
  .handler(async ({ data }) => {
    const words = Array.from(
      new Set(data.words.map((w) => w.trim().toLowerCase()).filter(Boolean))
    ).slice(0, 25);
    const target = Math.min(data.count, words.length);

    const key = process.env.LOVABLE_API_KEY;
    if (key) {
      try {
        const gateway = createLovableAiGatewayProvider(key);
        const sys = `You are an SAT vocabulary tutor writing questions in the style of Acely and the official Digital SAT.
For each target word, write ONE rigorous multiple-choice question that tests precise meaning in context.
Rules:
- Start with a 1–2 sentence academic passage (formal register: history, science, literary criticism, social studies) that uses the target word naturally.
- The question stem must be: 'As used in the passage above, "<word>" most nearly means:' — OR occasionally a fill-in-the-blank stem where the blank replaces the target word and choices are single words/short phrases.
- Provide exactly 4 answer choices. Choices must be plausible dictionary-style meanings; distractors should be common wrong senses, near-synonyms of wrong senses, or tempting misreadings. Avoid trivially wrong options.
- Exactly one choice is correct.
- "word": the exact target word.
- "prompt": passage + blank line + question stem.
- "correctIndex": 0..3.
- "explanation": <=220 chars; state why the correct choice fits the passage's context and briefly why the most tempting distractor is wrong.
- Do NOT mention the word's dictionary definition outside of the passage; the student must infer from context.
Return strict JSON matching the schema.`;
        const prompt = `Target words (${words.length}): ${words.join(", ")}
Build exactly ${target} questions, one per word, in the order given. Vary passage topics.`;

        const { object } = await generateObject({
          model: gateway("google/gemini-3-flash-preview"),
          schema: QuizSchema,
          system: sys,
          prompt,
        });
        if (object.questions.length > 0) return object;
      } catch (err) {
        console.warn("[generateCustomQuiz] AI unavailable, using heuristic fallback:", err);
      }
    }
    return heuristicQuiz(words, target);
  });

// ---------- Adaptive SAT questions from struggle words (Premium) ----------

const SatInput = z.object({
  struggleWords: z
    .array(z.object({ word: z.string().min(1).max(60), definition: z.string().max(500).optional() }))
    .min(1)
    .max(20),
  count: z.number().min(3).max(15).default(8),
});

export const generateAdaptiveSatQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SatInput.parse(input))
  .handler(async ({ data }) => {
    const list = data.struggleWords.slice(0, 20);
    const target = Math.min(data.count, list.length);

    const key = process.env.LOVABLE_API_KEY;
    if (key) {
      try {
        const gateway = createLovableAiGatewayProvider(key);
        const sys = `You are an expert Digital SAT Reading & Writing tutor. Generate authentic SAT "words in context" questions in the style of Acely and College Board practice.
Each question:
- 1–2 sentence academic passage (history, science, literary criticism, or social studies) using the target vocabulary word naturally in a nuanced sense.
- Stem: 'As used in the passage above, "<word>" most nearly means:' OR 'Which choice best completes the text?' with the target word replaced by a blank.
- 4 sophisticated, plausible distractors — often the word's OTHER dictionary senses that don't fit this context. Exactly one correct.
- "explanation" (<=240 chars): explain why the correct sense fits the passage's context, and why the most tempting distractor is wrong.
- Never repeat the answer verbatim in the passage.
Return strict JSON matching the schema.`;
        const prompt = `Build ${target} SAT questions, each focused on one of these struggle words:\n${list
          .map((w, i) => `${i + 1}. ${w.word}${w.definition ? ` — ${w.definition}` : ""}`)
          .join("\n")}\nUse only these words. Set "word" to the targeted word.`;

        const { object } = await generateObject({
          model: gateway("google/gemini-3-flash-preview"),
          schema: QuizSchema,
          system: sys,
          prompt,
        });
        if (object.questions.length > 0) return object;
      } catch (err) {
        console.warn("[generateAdaptiveSatQuestions] AI unavailable, using heuristic fallback:", err);
      }
    }
    return heuristicQuiz(
      list.map((w) => w.word),
      target
    );
  });
