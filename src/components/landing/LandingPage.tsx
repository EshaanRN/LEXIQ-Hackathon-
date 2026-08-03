import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  X,
  Mic,
  PenLine,
  ShieldCheck,
  Clock,
  TrendingUp,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Floating word marquee — drifts behind the hero                            */
/* -------------------------------------------------------------------------- */

const FLOAT_WORDS = [
  "ephemeral", "ubiquitous", "perfunctory", "sycophant", "magnanimous",
  "pellucid", "obfuscate", "quixotic", "laconic", "vicissitude",
  "sanguine", "cogent", "ineffable", "salient", "diaphanous",
  "ostensible", "recalcitrant", "ameliorate", "pragmatic", "verisimilitude",
];

function FloatingWords() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.13]">
        {FLOAT_WORDS.map((w, i) => {
          const top = (i * 53) % 95;
          const left = (i * 71) % 90;
          const dur = 18 + (i % 6) * 4;
          const delay = (i % 7) * -3;
          const size = 14 + ((i * 7) % 28);
          return (
            <span
              key={w + i}
              className="absolute font-display font-bold tracking-tight text-foreground will-change-transform"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                fontSize: `${size}px`,
                animation: `lex-float ${dur}s ease-in-out ${delay}s infinite`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes lex-float {
          0%, 100% { transform: translate3d(0,0,0) rotate(-2deg); opacity: 0.55; }
          50%      { transform: translate3d(20px,-30px,0) rotate(2deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  "Learning now" live ticker                                                */
/* -------------------------------------------------------------------------- */

const TICKER_EVENTS = [
  { who: "Maya", word: "perfunctory", verb: "mastered" },
  { who: "Devon", word: "sanguine", verb: "swiped right on" },
  { who: "Priya", word: "obfuscate", verb: "leveled up on" },
  { who: "Jordan", word: "ephemeral", verb: "nailed the checkpoint for" },
  { who: "Sofia", word: "quixotic", verb: "added to known" },
  { who: "Alex", word: "ubiquitous", verb: "pronounced correctly" },
  { who: "Riya", word: "laconic", verb: "defined" },
  { who: "Eli", word: "pellucid", verb: "mastered" },
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TICKER_EVENTS.length), 2200);
    return () => clearInterval(t);
  }, []);
  const e = TICKER_EVENTS[idx];
  return (
    <div className="mx-auto mt-10 inline-flex max-w-full items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs backdrop-blur">
      <span className="relative inline-flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{e.who}</span>{" "}
        just {e.verb}{" "}
        <span className="font-semibold text-primary">{e.word}</span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated score-gain visualization                                         */
/* -------------------------------------------------------------------------- */

function ScoreGain() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPct(1),
      { threshold: 0.4 },
    );
    const el = document.getElementById("score-gain");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const before = 480;
  const after = 660;
  const max = 800;

  return (
    <div id="score-gain" className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Avg. SAT reading score</span>
        <span className="text-success">+{after - before} pts</span>
      </div>
      <div className="mt-6 space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Before Lexiq</span>
            <span className="font-display font-bold">{before}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-muted-foreground/50 transition-all duration-[1200ms] ease-out"
              style={{ width: pct ? `${(before / max) * 100}%` : "0%" }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-primary">After 6 weeks</span>
            <span className="font-display font-bold text-primary">{after}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_24px_-4px_var(--primary)] transition-all duration-[1600ms] ease-out"
              style={{ width: pct ? `${(after / max) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Based on self-reported practice-section scores from 1,200+ beta users
        who used Lexiq at least 5 minutes a day.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interest-tuned example rotator                                            */
/* -------------------------------------------------------------------------- */

const INTEREST_PROOF = [
  {
    tag: "⚽ Sports",
    word: "lament",
    sentence: "LeBron lamented the Lakers' collapse, insisting one player cannot carry a title run alone.",
  },
  {
    tag: "🎮 Gaming",
    word: "tenacious",
    sentence: "Only the most tenacious players ever finish an Elden Ring no-hit run.",
  },
  {
    tag: "🎵 Music",
    word: "prolific",
    sentence: "Taylor Swift is so prolific that fans need a spreadsheet to track the re-releases.",
  },
  {
    tag: "🔬 Science",
    word: "empirical",
    sentence: "Rosalind Franklin's empirical X-ray images made the double helix impossible to deny.",
  },
  {
    tag: "🍕 Food",
    word: "meticulous",
    sentence: "A meticulous ramen chef will time the egg to the second, every single bowl.",
  },
];

function InterestProof() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % INTEREST_PROOF.length), 3400);
    return () => clearInterval(t);
  }, []);
  const e = INTEREST_PROOF[i];
  return (
    <div className="mx-auto mt-8 w-full max-w-lg rounded-2xl border border-border/60 bg-card/60 p-4 text-left backdrop-blur lg:mx-0">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ring-1 ring-border">
          {e.tag}
        </span>
        <span className="font-display text-sm font-bold text-primary">{e.word}</span>
      </div>
      <p key={e.word} className="animate-in fade-in slide-in-from-bottom-1 duration-500 mt-3 text-sm leading-relaxed text-foreground/90">
        “{e.sentence}”
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Same word. Twelve different worlds. Pick yours in onboarding.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main landing page                                                         */
/* -------------------------------------------------------------------------- */



export function LandingPage() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && /^[A-Za-z0-9]{3,16}$/.test(ref)) {
        localStorage.setItem("lexiq:pending-ref", ref.toUpperCase());
      }
    } catch { /* noop */ }
  }, []);
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-80px] h-[420px] w-[420px] rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute top-[40%] left-[-120px] h-[360px] w-[360px] rounded-full bg-primary/15 blur-[140px]" />
      </div>

      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-bold tracking-tight">Lexiq</span>
        <nav className="flex items-center gap-5 text-sm font-semibold text-muted-foreground">
          <Link to="/pricing" className="transition hover:text-foreground">Pricing</Link>
          <Link to="/auth" className="transition hover:text-foreground">Sign in</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pt-8 pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <FloatingWords />

        <div className="relative text-center lg:text-left">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 inline-flex items-center gap-2 rounded-full bg-surface-2/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground ring-1 ring-border backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            2,000+ real SAT &amp; ACT words
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
            <span className="block">1,000 words</span>
            <span className="block text-muted-foreground/70">between you</span>
            <span className="relative inline-block">
              <span className="bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_200%] bg-clip-text text-transparent [animation:lex-aurora_6s_ease-in-out_infinite]">
                and a 1500.
              </span>
              <svg
                aria-hidden
                viewBox="0 0 300 12"
                className="absolute -bottom-2 left-0 h-3 w-full text-primary/60"
                preserveAspectRatio="none"
              >
                <path d="M2 8 C 60 2, 120 11, 180 5 S 260 3, 298 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <style>{`
            @keyframes lex-aurora {
              0%, 100% { background-position: 0% 50%; }
              50%      { background-position: 100% 50%; }
            }
          `}</style>

          <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 mx-auto mt-8 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
            Lexiq learns what you like — basketball, anime, chemistry, whatever —
            then writes every example sentence around it. Swipe five minutes a
            day and the words stop feeling like flashcards.
          </p>

          {/* Example-sentence rotator — shows the personalization promise */}
          <InterestProof />



          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
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
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />No credit card</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />2,000+ test words</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />5 min a day</span>
          </div>

          <LiveTicker />
        </div>

        {/* Phone mockup */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 relative mx-auto px-12 py-10 [perspective:1400px]">
          <PhoneMockup />
        </div>
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

      {/* SCORE GAIN + STATS */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ScoreGain />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Stat big="+180" label="avg. vocab section points" />
            <Stat big="2,000+" label="high-frequency SAT & ACT words" />
            <Stat big="5 min" label="a day is enough" />
          </div>
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

      {/* TESTIMONIALS */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionLabel>What students say</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          The reviews write themselves.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Quote
            text="I went from skipping vocab to opening Lexiq before bed. It just feels good to swipe."
            author="Maya, junior" gain="+120 reading"
          />
          <Quote
            text="The AI checkpoints actually called me out when I faked a definition. My SAT reading jumped 80."
            author="Devon, senior" gain="+80 reading"
          />
          <Quote
            text="Other apps make me feel like I'm studying. This one feels like a game I happen to win."
            author="Priya, sophomore" gain="+150 reading"
          />
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionLabel>What's inside</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Five tools. One streak.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every screen in Lexiq is built around a single loop: see a word,
          decide if you know it, prove it, level up.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Tool icon={<Sparkles className="h-5 w-5" />} title="Swipe" body="Your personalized deck. Right if you own it, left to learn it." />
          <Tool icon={<Target className="h-5 w-5" />} title="Test" body="AI checkpoints grade your definitions, sentences, and pronunciation." />
          <Tool icon={<TrendingUp className="h-5 w-5" />} title="Stats" body="See your mastery curve, weak areas, and projected SAT/ACT gain." />
          <Tool icon={<Heart className="h-5 w-5" />} title="Avatar" body="Earn coins, unlock looks, and make your profile yours." />
          <Tool icon={<ShoppingBag className="h-5 w-5" />} title="Shop" body="Spend coins on themes, boosts, and streak freezes." />
        </div>
      </section>

      {/* HOW WE GRADE */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionLabel>AI checkpoints</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          You can't fake mastery here.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Feature icon={<BookOpen className="h-5 w-5" />} title="Define it"
            body="Write the meaning in your own words. AI checks accuracy, not memorization." />
          <Feature icon={<PenLine className="h-5 w-5" />} title="Use it"
            body="Drop the word into a real sentence. We grade context, grammar, and nuance." />
          <Feature icon={<Mic className="h-5 w-5" />} title="Say it"
            body="Pronounce it aloud. Speech recognition scores you on the spot." />
        </div>
      </section>

      {/* COMPARISON */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <SectionLabel>Why not flashcards</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Lexiq vs. the way you've been doing it.
        </h2>
        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur">
          <div className="grid grid-cols-3 border-b border-border bg-surface-2/40 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:px-6">
            <span></span>
            <span className="text-center text-foreground">Lexiq</span>
            <span className="text-center">Old-school flashcards</span>
          </div>
          {[
            ["Personalized to your level", true, false],
            ["Spaced repetition that actually adapts", true, false],
            ["Grades your real understanding", true, false],
            ["Streaks, XP, coins, ranks", true, false],
            ["Works on the bus, in line, in bed", true, true],
            ["Costs nothing to start", true, true],
          ].map(([label, a, b], i) => (
            <div
              key={i}
              className="grid grid-cols-3 items-center border-b border-border/60 px-4 py-4 text-sm last:border-b-0 sm:px-6"
            >
              <span className="text-muted-foreground">{label as string}</span>
              <span className="flex justify-center">
                {a ? <CheckCircle2 className="h-5 w-5 text-success" /> : <X className="h-5 w-5 text-muted-foreground/50" />}
              </span>
              <span className="flex justify-center">
                {b ? <CheckCircle2 className="h-5 w-5 text-success/70" /> : <X className="h-5 w-5 text-muted-foreground/50" />}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          <TrustCard icon={<ShieldCheck className="h-5 w-5" />} title="Private by default"
            body="Your progress is yours. We never sell data and never show ads." />
          <TrustCard icon={<Clock className="h-5 w-5" />} title="Built for 5-minute sessions"
            body="No 45-minute study blocks. Open it between classes, ship a streak." />
          <TrustCard icon={<Brain className="h-5 w-5" />} title="Based on what actually shows up"
            body="Every word is pulled from real SAT and ACT release tests — no filler." />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Questions, answered.
        </h2>
        <div className="mt-10 space-y-3">
          <FaqItem q="Is Lexiq free? What does Premium cost?"
            a="The core experience — full word library, swipe deck, streaks, ranks, and basic checkpoints — is free forever. Optional Premium unlocks AI checkpoints, custom tests, and adaptive SAT practice for $4.99/month or $39/year. See the Pricing page for details." />
          <FaqItem q="How long until I see SAT/ACT score gains?"
            a="Most students notice a difference on practice sections inside 3 weeks. Vocabulary lifts reading speed and clue-based questions the fastest." />
          <FaqItem q="What if I miss a day?"
            a="You get streak freezes built in. One bad day doesn't reset your progress — we want this to be sustainable, not stressful." />
          <FaqItem q="Does it work on my phone?"
            a="Lexiq is mobile-first. It works beautifully on iOS, Android, tablet, and desktop browsers — no install required." />
          <FaqItem q="Where do the words come from?"
            a="Every word is sourced from publicly released SAT and ACT practice tests, weighted by how often they appear and how often they're missed." />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative mx-auto w-full max-w-4xl px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-x-10 inset-y-0 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-3xl" />
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Test day is coming.
          <br />
          <span className="bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_200%] bg-clip-text text-transparent [animation:lex-aurora_6s_ease-in-out_infinite]">
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

      <footer className="border-t border-border/60 pb-24 pt-8 text-center text-xs text-muted-foreground sm:pb-8">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/refund" className="hover:text-foreground">Refunds</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link to="/trust" className="hover:text-foreground">Trust & Security</Link>
        </nav>
        <div>© {new Date().getFullYear()} LEXIQ. All rights reserved.</div>
        <div className="mt-1 text-[11px] text-muted-foreground/70">
          Payments processed by Paddle.com — our Merchant of Record.
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl sm:hidden">
        <Link
          to="/auth"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
        >
          Start free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface-2/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground ring-1 ring-border backdrop-blur">
      {children}
    </span>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="group rounded-3xl border border-border bg-card/60 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-primary/40">
      <span className="font-display text-sm font-bold text-primary">{n}</span>
      <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group rounded-3xl border border-border bg-card/60 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-primary/40">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30 transition group-hover:scale-110">
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
      <div className="font-display text-5xl font-bold tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
        {big}
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Tool({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur transition hover:border-primary/40 hover:-translate-y-0.5">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function TrustCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 backdrop-blur">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-success/30">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-border bg-card/60 px-5 py-4 backdrop-blur transition open:border-primary/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold">
        {q}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-muted-foreground transition group-open:rotate-45 group-open:text-primary">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  );
}

function Quote({ text, author, gain }: { text: string; author: string; gain?: string }) {
  return (
    <div className="relative rounded-3xl border border-border bg-card/60 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        {gain && (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-success ring-1 ring-success/30">
            {gain}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed">"{text}"</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">— {author}</p>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative [transform-style:preserve-3d] [transform:rotateY(-10deg)_rotateX(6deg)]">
      {/* Layered glows */}
      <div className="pointer-events-none absolute -inset-10 -z-20 rounded-[4rem] bg-gradient-to-br from-primary/50 via-accent/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[3.5rem] bg-gradient-to-tr from-accent/30 via-transparent to-primary/40 blur-2xl" />

      {/* Floating chips — in front of phone */}
      <div className="absolute -left-14 top-10 z-30 hidden rotate-[-8deg] rounded-2xl border border-border bg-card/90 px-3 py-2 text-[11px] font-semibold shadow-2xl backdrop-blur-md sm:flex items-center gap-1.5 [animation:lex-float_8s_ease-in-out_infinite]">
        <Flame className="h-3.5 w-3.5 text-danger" />
        <span>12-day streak</span>
      </div>
      <div className="absolute -right-12 top-32 z-30 hidden rotate-[5deg] rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/20 to-card/90 px-3 py-2 text-[11px] font-bold shadow-2xl backdrop-blur-md sm:flex items-center gap-1.5 [animation:lex-float_9s_ease-in-out_-1s_infinite]">
        <Zap className="h-3.5 w-3.5 text-gold" />
        <span>+50 XP</span>
      </div>
      <div className="absolute -right-16 bottom-24 z-30 hidden rotate-[8deg] rounded-2xl border border-success/40 bg-card/90 px-3 py-2 text-[11px] font-semibold shadow-2xl backdrop-blur-md sm:flex items-center gap-1.5 [animation:lex-float_11s_ease-in-out_-3s_infinite]">
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        <span>Mastered "ephemeral"</span>
      </div>
      <div className="absolute -left-16 bottom-16 z-30 hidden rotate-[-6deg] rounded-2xl border border-primary/40 bg-card/90 px-3 py-2 text-[11px] font-semibold shadow-2xl backdrop-blur-md sm:flex items-center gap-1.5 [animation:lex-float_10s_ease-in-out_-2s_infinite]">
        <Trophy className="h-3.5 w-3.5 text-primary" />
        <span>Level 7 · Wordsmith</span>
      </div>

      {/* Side buttons */}
      <div className="absolute -left-[3px] top-28 z-0 h-8 w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -left-[3px] top-44 z-0 h-12 w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -left-[3px] top-60 z-0 h-12 w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -right-[3px] top-40 z-0 h-16 w-[3px] rounded-r bg-zinc-700" />

      {/* Phone body */}
      <div className="relative z-10 w-[300px] rounded-[2.75rem] bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-[3px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] sm:w-[330px]">
        <div className="rounded-[2.65rem] bg-black p-2.5 ring-1 ring-white/5">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-background">
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

            {/* Screen glare */}
            <div className="pointer-events-none absolute inset-0 z-20 rounded-[2.25rem] bg-gradient-to-br from-white/10 via-transparent to-transparent mix-blend-overlay" />

            {/* status bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] font-semibold text-foreground">
              <span>9:41</span>
              <span className="opacity-70">●●●●</span>
            </div>

            {/* HUD */}
            <div className="mt-5 flex items-center justify-between px-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xs font-bold text-primary-foreground shadow-lg">
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
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-card to-accent/20 p-5 ring-1 ring-border shadow-xl">
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
    </div>
  );
}
