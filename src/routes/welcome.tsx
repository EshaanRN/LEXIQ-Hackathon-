import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Trophy } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lexiq — Master SAT & ACT vocabulary, one swipe at a time" },
      {
        name: "description",
        content:
          "Lexiq turns vocabulary prep into a daily habit. Swipe through SAT and ACT words tailored to you, level up, and walk into test day ready.",
      },
      { property: "og:title", content: "Lexiq — SAT & ACT vocabulary, gamified" },
      {
        property: "og:description",
        content: "A beautiful, addictive way to master the words that show up on the SAT and ACT.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-80px] h-[420px] w-[420px] rounded-full bg-accent/25 blur-[140px]" />
      </div>

      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-bold tracking-tight">Lexiq</span>
        <Link
          to="/auth"
          className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pt-12 pb-16 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-surface-2/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground ring-1 ring-border backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Built for SAT &amp; ACT
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Vocabulary,
          <br />
          <span className="bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
            reimagined.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          Swipe through the words that actually show up on the SAT and ACT.
          Personalized. Addictive. Designed to make every minute count.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.03] glow-primary"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/auth"
            className="rounded-full px-6 py-3.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            I already have an account →
          </Link>
        </motion.div>
      </section>

      {/* Feature row */}
      <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        <Feature
          icon={<Target className="h-5 w-5" />}
          title="Personalized"
          body="A placement quiz tunes every card to your level — no wasted reps."
        />
        <Feature
          icon={<Sparkles className="h-5 w-5" />}
          title="Swipe to learn"
          body="One word at a time. Right if you know it, left to learn it for XP."
        />
        <Feature
          icon={<Trophy className="h-5 w-5" />}
          title="Level up"
          body="Streaks, ranks, coins, and avatars that make showing up addictive."
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 backdrop-blur">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
