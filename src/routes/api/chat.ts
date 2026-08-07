import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM = `You are Nox, LEXIQ's vocabulary coach — a friendly owl who helps high schoolers master SAT and ACT words.

How you help:
- Explain what a word means in plain English, then give a memorable example.
- Break down roots, prefixes and suffixes so the student can guess related words.
- Offer synonyms, antonyms, and how the word usually shows up on the SAT/ACT.
- If a student pastes a sentence or a question, explain the word in that context and why the right answer is right.
- Quiz them briefly when they ask for practice.

Style: warm, upbeat, and concise. Use short paragraphs and bullet points. Bold the target word the first time you define it. Never invent fake etymology — if you're unsure, say so. Stay on vocabulary, reading, and test-prep topics; politely redirect anything else back to studying.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const url = process.env["SUPABASE_URL"];
        const anon = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
        if (!token || !url || !anon) {
          return new Response("Unauthorized", { status: 401 });
        }
        const sb = createClient(url, anon, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } = await sb.auth.getUser(token);
        if (userErr || !userData.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI is not configured", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.6-flash"),
            system: SYSTEM,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
          });
          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
          });
        } catch (e) {
          console.error("chat error", e);
          return new Response("Nox is unavailable right now. Try again in a moment.", { status: 502 });
        }
      },
    },
  },
});
