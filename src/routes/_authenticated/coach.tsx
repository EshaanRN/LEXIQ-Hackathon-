import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import owl from "@/assets/lexiq-owl-transparent.png";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachPage,
  head: () => ({
    meta: [
      { title: "Ask Nox — LEXIQ vocabulary coach" },
      {
        name: "description",
        content:
          "Chat with Nox, the LEXIQ vocabulary coach, to clear up confusing SAT and ACT words, roots, and answer choices.",
      },
      { property: "og:title", content: "Ask Nox — LEXIQ vocabulary coach" },
      {
        property: "og:description",
        content: "Get instant, friendly explanations for any SAT or ACT word you're stuck on.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STARTERS = [
  "What does “meritorious” mean?",
  "Give me 5 hard SAT words with examples",
  "Quiz me on words I keep missing",
  "Explain the root “bene”",
];

function CoachPage() {
  const [error, setError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    onError: (e) => setError(e.message || "Nox couldn't answer. Try again."),
  });

  const busy = status === "submitted" || status === "streaming";

  function focusInput() {
    requestAnimationFrame(() => taRef.current?.focus());
  }

  useEffect(() => {
    focusInput();
  }, []);

  useEffect(() => {
    if (!busy) focusInput();
  }, [busy]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setError(null);
    await sendMessage({ text: t });
    focusInput();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-28 pt-4">
      <header className="flex items-center gap-3">
        <Link
          to="/app"
          aria-label="Back to swiping"
          className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <img src={owl} alt="Nox, the LEXIQ owl" className="h-9 w-9 object-contain" />
        <div>
          <h1 className="font-display text-lg font-bold leading-none">Ask Nox</h1>
          <p className="text-[11px] text-muted-foreground">Your vocabulary coach</p>
        </div>
      </header>

      <Conversation className="mt-4 flex-1">
        <ConversationContent className="gap-4">
          {messages.length === 0 && (
            <div className="mt-6 text-center">
              <img src={owl} alt="" className="mx-auto h-24 w-24 object-contain" />
              <p className="mt-3 font-display text-xl font-bold">Stuck on a word?</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                Ask me what it means, how it shows up on the test, or quiz yourself.
              </p>
              <div className="mt-5 grid gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm ring-1 ring-border transition hover:ring-primary/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (!text) return null;
            return (
              <Message key={m.id} from={m.role}>
                <MessageContent
                  className={
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent p-0 text-foreground"
                  }
                >
                  <MessageResponse>{text}</MessageResponse>
                </MessageContent>
              </Message>
            );
          })}

          {status === "submitted" && (
            <Shimmer className="text-sm">Nox is thinking…</Shimmer>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-24 mt-3">
        <PromptInput
          onSubmit={(msg) => {
            void send(msg.text ?? "");
          }}
        >
          <PromptInputTextarea ref={taRef} placeholder="Ask about any word…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={busy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
