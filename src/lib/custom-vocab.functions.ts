import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const WordSchema = z.object({
  word: z.string(),
  partOfSpeech: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  definition: z.string(),
  studentDefinition: z.string(),
  satContext: z.string(),
  root: z.string(),
  rootMeaning: z.string(),
  example: z.string(),
  synonyms: z.array(z.string()),
});

const Input = z.object({ word: z.string().min(1).max(40) });

export const generateCustomWord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const target = data.word.trim().toLowerCase();

    const sys = `You are an SAT/ACT vocabulary expert. For a target word, produce a complete study card:
- word: correctly capitalized dictionary form
- partOfSpeech: one of noun, verb, adjective, adverb (pick the most common form)
- difficulty: easy | medium | hard relative to a high schooler
- definition: one clear sentence, dictionary-quality
- studentDefinition: casual, friendly phrasing under 15 words
- satContext: one SAT/ACT-style academic sentence using the word
- root: the primary Latin/Greek root (short)
- rootMeaning: format "root=meaning"
- example: one memorable everyday example sentence
- synonyms: exactly 3 concise synonyms
Return strict JSON matching the schema. If the input is not a real English word, still make your best guess.`;

    const { object } = await generateObject({
      model: gateway("google/gemini-3-flash-preview"),
      schema: WordSchema,
      system: sys,
      prompt: `Target word: ${target}`,
    });
    return object;
  });
