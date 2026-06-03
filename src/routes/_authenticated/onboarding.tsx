import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/Avatar";
import {
  AVATAR_ITEMS,
  SLOTS,
  defaultAvatar,
  defaultOwned,
  type AvatarEquipped,
  type AvatarSlot,
} from "@/lib/avatar";
import { VOCAB } from "@/data/vocab";
import { applyProfile, loadStateForUser, RANKS } from "@/lib/game-store";

export const Route = createFileRoute("/_authenticated/onboarding")({
  ssr: false,
  component: Onboarding,
});

const INTERESTS = [
  "📚 Reading", "🎬 Movies", "🎮 Gaming", "🎵 Music", "⚽ Sports",
  "🎨 Art", "🔬 Science", "💻 Tech", "✈️ Travel", "🍕 Food",
  "👗 Fashion", "🏛️ History",
];

function Onboarding() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<AvatarEquipped>(defaultAvatar());
  const [interests, setInterests] = useState<string[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [saving, setSaving] = useState(false);

  // Pick 5 random hard-ish words for placement
  const quizWords = VOCAB.slice(0, 5);

  function toggleInterest(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  function answerQuiz(knew: boolean) {
    if (knew) setCorrect((c) => c + 1);
    if (quizIdx + 1 >= quizWords.length) {
      setStep(5);
    } else {
      setQuizIdx((i) => i + 1);
    }
  }

  function rankFromScore(c: number) {
    const idx = Math.min(RANKS.length - 1, Math.floor((c / quizWords.length) * 4));
    return RANKS[idx].name;
  }

  async function finish() {
    setSaving(true);
    const startingRank = rankFromScore(correct);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim() || `Player${Math.floor(Math.random() * 9999)}`,
        avatar: avatar as never,
        equipped: avatar as never,
        owned_items: defaultOwned(),
        interests,
        starting_rank: startingRank,
        onboarding_complete: true,
      })
      .eq("id", user.id);
    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }
    loadStateForUser(user.id);
    applyProfile({
      username: username.trim() || null,
      avatar,
      owned_items: defaultOwned(),
    });
    navigate({ to: "/app", replace: true });
  }

  const steps = ["Username", "Avatar", "Interests", "Placement", "Placement", "Rank"];
  const pct = ((step + 1) / steps.length) * 100;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
      <div className="mb-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {step === 0 && (
            <>
              <h1 className="font-display text-3xl font-bold">Pick your username</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This is how you'll appear on the leaderboards.
              </p>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. wordwizard24"
                className="mt-6 w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-lg font-display focus:border-primary focus:outline-none"
              />
              <NextBtn disabled={username.trim().length < 3} onClick={() => setStep(1)} />
            </>
          )}

          {step === 1 && (
            <AvatarBuilder avatar={avatar} setAvatar={setAvatar} owned={defaultOwned()} onNext={() => setStep(2)} />
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-3xl font-bold">What are you into?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll tailor example sentences to your interests.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const on = interests.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                        on
                          ? "bg-primary text-primary-foreground ring-primary glow-primary"
                          : "bg-surface-2 text-foreground ring-border"
                      }`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
              <NextBtn disabled={interests.length < 2} onClick={() => setStep(3)} label="Continue" />
            </>
          )}

          {(step === 3 || step === 4) && (
            <>
              <h1 className="font-display text-3xl font-bold">Quick placement</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Do you know this word? Honest answers = better recommendations.
              </p>
              <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Word {quizIdx + 1} of {quizWords.length}
                </p>
                <h2 className="mt-4 font-display text-5xl font-bold text-gradient-primary">
                  {quizWords[quizIdx].word}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">{quizWords[quizIdx].pronunciation}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    answerQuiz(false);
                    if (step < 4) setStep(step + 1);
                  }}
                  className="flex-1 rounded-full bg-surface-2 py-3 font-display font-bold uppercase tracking-widest ring-1 ring-border"
                >
                  Don't know
                </button>
                <button
                  onClick={() => {
                    answerQuiz(true);
                    if (step < 4) setStep(step + 1);
                  }}
                  className="flex-1 rounded-full bg-primary py-3 font-display font-bold uppercase tracking-widest text-primary-foreground glow-primary"
                >
                  Know it
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Avatar equipped={avatar} size={120} />
              <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
                Starting rank
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold text-gradient-primary">
                {rankFromScore(correct)}
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                You knew {correct} of {quizWords.length}. Let's start mastering the rest.
              </p>
              <button
                onClick={finish}
                disabled={saving}
                className="mt-10 w-full rounded-full bg-primary py-4 font-display text-base font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-60"
              >
                {saving ? "Preparing your feed..." : "Enter SAT Swipe"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function NextBtn({ disabled, onClick, label = "Next" }: { disabled?: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mt-8 w-full rounded-full bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function AvatarBuilder({
  avatar,
  setAvatar,
  owned,
  onNext,
}: {
  avatar: AvatarEquipped;
  setAvatar: (a: AvatarEquipped) => void;
  owned: string[];
  onNext: () => void;
}) {
  const [slot, setSlot] = useState<AvatarSlot>("hair");
  const items = AVATAR_ITEMS.filter((i) => i.slot === slot && owned.includes(i.id));
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Build your avatar</h1>
      <p className="mt-1 text-sm text-muted-foreground">More items unlock as you level up.</p>
      <div className="mt-6 flex flex-col items-center">
        <Avatar equipped={avatar} size={140} />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SLOTS.map((s) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest ring-1 ${
              slot === s
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-surface-2 text-muted-foreground ring-border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map((it) => {
          const active = avatar[slot] === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setAvatar({ ...avatar, [slot]: it.id })}
              className={`flex h-16 flex-col items-center justify-center gap-1 rounded-2xl ring-1 ${
                active ? "ring-primary bg-primary/15" : "ring-border bg-surface-2"
              }`}
              style={
                slot === "skin" || slot === "clothing"
                  ? { background: it.visual }
                  : slot === "background"
                    ? { background: it.visual }
                    : undefined
              }
            >
              {(slot === "hair" || slot === "eyes" || slot === "face" || slot === "accessory") && (
                <span className="text-2xl">{it.visual || "—"}</span>
              )}
              <span className="text-[9px] uppercase tracking-widest opacity-80">{it.name}</span>
            </button>
          );
        })}
      </div>
      <NextBtn onClick={onNext} label="Looks Good" />
    </>
  );
}
