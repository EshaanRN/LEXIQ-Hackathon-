import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const QuestionSchema = z.object({
  word: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()).length(4),
  correctIndex: z.number().min(0).max(3),
  explanation: z.string(),
});
const QuizSchema = z.object({ questions: z.array(QuestionSchema).min(1).max(20) });

// -------- Custom test from user-supplied words (Premium) --------

const CustomInput = z.object({
  words: z.array(z.string().min(1).max(60)).min(1).max(25),
  count: z.number().min(1).max(20).default(10),
});

export const generateCustomQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CustomInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const words = Array.from(new Set(data.words.map((w) => w.trim().toLowerCase()).filter(Boolean))).slice(0, 25);
    const target = Math.min(data.count, words.length);

    const sys = `You build SAT-style vocabulary quizzes. For each target word, write ONE high-quality multiple-choice question that tests precise meaning in context.
Rules:
- Each question MUST be about exactly one of the provided words (set the "word" field accordingly).
- Provide 4 plausible choices; only one correct.
- "correctIndex" is 0..3.
- "explanation": one short sentence (<= 180 chars).
- Mix question styles: synonym, fill-in-the-blank sentence, "best meaning in context".
Return strict JSON matching the schema.`;
    const prompt = `Target words (${words.length}): ${words.join(", ")}\nBuild exactly ${target} questions, one per word (in order). Use sophisticated SAT-level distractors.`;

    const { object } = await generateObject({
      model: gateway("google/gemini-3-flash-preview"),
      schema: QuizSchema,
      system: sys,
      prompt,
    });
    return object;
  });

// -------- Adaptive SAT questions from a student's struggle words (Premium) --------

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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const list = data.struggleWords.slice(0, 20);
    const target = Math.min(data.count, list.length);

    const sys = `You are an expert SAT prep tutor. Generate authentic SAT Reading & Writing "words in context" questions.
Each question:
- Uses the target vocabulary word inside a short 1-2 sentence SAT-style passage (academic register).
- Asks "As used in the passage above, X most nearly means…" OR a fill-in-the-blank variant.
- 4 sophisticated, plausible distractors. Exactly one correct.
- "explanation" (<= 200 chars) explains WHY the right answer is best AND why one tempting distractor is wrong.
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
    return object;
  });
