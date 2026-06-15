import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  Flame,
  BookOpen,
  Brain,
  Zap,
  Heart,
  ShoppingBag,
  Star,
  CheckCircle2,
} from "lucide-react";

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
        content:
          "A beautiful, addictive way to master the words that show up on the SAT and ACT.",
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
        <div className="absolute top-[40%] left-[-120px] h-[360px] w-[360px] rounded-full bg-primary/15 blur-[140px]" />
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

      {/* HERO */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pt-8 pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="text-center lg:text-left">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 inline-flex items-center gap-2 rounded-full bg-surface-2/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground ring-1 ring-border backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Built for SAT &amp; ACT
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl"
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
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0"
          >
            Swipe through the words that actually show up on the SAT and ACT.
            Personalized. Addictive. Designed to make every minute count.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
          >
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.03] glow-primary"
            >
              Get started — free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth"
              className="rounded-full px-6 py-3.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              I already have an account →
            </Link>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />No credit card</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />2,000+ test words</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />5 min a day</span>
          </div>
        </div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto"
        >
          <PhoneMockup />
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Three steps to a bigger vocabulary.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Step n="01" title="Take the placement quiz" body="A quick check tunes the deck to words you actually need — no easy wins, no impossible jumps." />
          <Step n="02" title="Swipe a few cards a day" body="Right if you know it, left if you don't. We surface the hard ones again until they stick." />
          <Step n="03" title="Hit checkpoints, level up" body="Mini speaking & writing tests prove mastery and unlock XP, ranks, coins, and avatars." />
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionLabel>Why Lexiq</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Built like a game. Works like a tutor.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Target className="h-5 w-5" />} title="Personalized deck"
            body="A placement quiz tunes every card to your level — no wasted reps on words you already own." />
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Swipe to learn"
            body="One word at a time. Right if you know it, left to learn it. Earn XP either way." />
          <Feature icon={<Brain className="h-5 w-5" />} title="AI checkpoints"
            body="Define it, use it in a sentence, or say it out loud. AI grades every dimension." />
          <Feature icon={<Flame className="h-5 w-5" />} title="Streaks that stick"
            body="Daily streaks, gentle nudges, and freeze tokens so one bad day doesn't break you." />
          <Feature icon={<Trophy className="h-5 w-5" />} title="Ranks & XP"
            body="Climb from Novice to Wordsmith. Every word you master moves a real progress bar." />
          <Feature icon={<ShoppingBag className="h-5 w-5" />} title="Coins & avatars"
            body="Spend coins on avatars, themes, and boosts. Make the grind feel like a reward." />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat big="+180" label="avg. vocab section points" />
          <Stat big="2,000+" label="high-frequency SAT & ACT words" />
          <Stat big="5 min" label="a day is enough" />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Quote
            text="I went from skipping vocab to opening Lexiq before bed. It just feels good to swipe."
            author="Maya, junior"
          />
          <Quote
            text="The AI checkpoints actually called me out when I faked a definition. My SAT reading jumped 80."
            author="Devon, senior"
          />
          <Quote
            text="Other apps make me feel like I'm studying. This one feels like a game I happen to win."
            author="Priya, sophomore"
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto w-full max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Test day is coming.
          <br />
          <span className="bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
            Walk in ready.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Join thousands of students turning five minutes a day into the words
          that move the needle on the SAT and ACT.
        </p>
        <Link
          to="/auth"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.03] glow-primary"
        >
          Get started — free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">No credit card. Cancel anytime. Built by students, for students.</p>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lexiq. All rights reserved.
      </footer>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface-2/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground ring-1 ring-border backdrop-blur">
      {children}
    </span>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 backdrop-blur">
      <span className="font-display text-sm font-bold text-primary">{n}</span>
      <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 backdrop-blur transition hover:border-primary/40">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-8 text-center backdrop-blur">
      <div className="font-display text-5xl font-bold tracking-tight text-gradient-primary bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
        {big}
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Quote({ text, author }: { text: string; author: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 backdrop-blur">
      <div className="flex gap-0.5 text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed">"{text}"</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">— {author}</p>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative">
      {/* glow behind */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/40 to-accent/30 blur-3xl" />

      <div className="relative w-[300px] rounded-[2.75rem] border border-border bg-background p-3 shadow-2xl ring-1 ring-white/5 sm:w-[330px]">
        {/* notch */}
        <div className="absolute left-1/2 top-3 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl rounded-t-md bg-black" />

        <div className="overflow-hidden rounded-[2.25rem] bg-background">
          {/* status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] font-semibold text-foreground">
            <span>9:41</span>
            <span className="opacity-70">●●●●</span>
          </div>

          {/* HUD */}
          <div className="flex items-center justify-between px-5 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xs font-bold text-primary-foreground">
                LX
              </div>
              <div>
                <p className="font-display text-xs font-bold">Lvl 7</p>
                <p className="text-[9px] text-muted-foreground">Wordsmith</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 font-semibold">
                <Flame className="h-3 w-3 text-danger" />12
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 font-semibold">
                <Zap className="h-3 w-3 text-gold" />2,340
              </span>
            </div>
          </div>

          {/* card */}
          <div className="px-5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-card to-accent/20 p-5 ring-1 ring-border">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-muted-foreground">
                <span>SAT · adjective</span>
                <Heart className="h-3 w-3 text-danger" />
              </div>
              <div className="mt-8 text-center">
                <h3 className="font-display text-4xl font-bold tracking-tight">
                  ephemeral
                </h3>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  /əˈfem(ə)rəl/
                </p>
              </div>
              <div className="absolute inset-x-5 bottom-5">
                <div className="rounded-2xl bg-background/60 p-3 backdrop-blur ring-1 ring-border">
                  <p className="text-[10px] uppercase tracking-widest text-primary">
                    Definition
                  </p>
                  <p className="mt-1 text-xs leading-snug">
                    Lasting for a very short time.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 pb-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-danger/15 ring-1 ring-danger/40">
                <BookOpen className="h-4 w-4 text-danger" />
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground glow-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-success/15 ring-1 ring-success/40">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            </div>
          </div>

          {/* bottom nav */}
          <div className="flex items-center justify-around border-t border-border bg-card/60 px-4 py-2 backdrop-blur">
            {[Sparkles, Brain, Trophy, ShoppingBag].map((Icon, i) => (
              <div
                key={i}
                className={`grid h-8 w-8 place-items-center rounded-xl ${i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
