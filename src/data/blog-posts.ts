export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO
  readMinutes: number;
  /** Structured content blocks for clean rendering */
  content: BlogBlock[];
}

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "link"; href: string; text: string };

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-learnlexiq-helps-students-master-sat-vocabulary-faster",
    title: "How LearnLexiq Helps Students Master SAT Vocabulary Faster",
    summary:
      "Discover how LearnLexiq turns SAT vocabulary into an addictive swipe game so students learn high-frequency words faster and remember them longer.",
    date: "2026-06-15",
    readMinutes: 4,
    content: [
      {
        type: "p",
        text: "Studying SAT vocabulary used to mean flashcards, long word lists, and a lot of forgetting. LearnLexiq replaces that grind with a fast, swipe-based learning loop designed for how students actually study today — short sessions, instant feedback, and visible progress.",
      },
      { type: "h2", text: "A Smarter Way to Learn SAT Words" },
      {
        type: "p",
        text: "LearnLexiq focuses on the words that show up most often on the SAT and ACT. Instead of memorizing random lists, you see each word in context, with a definition, example sentence, and quick checks that reinforce meaning.",
      },
      { type: "h3", text: "Key features that speed up learning" },
      {
        type: "ul",
        items: [
          "Swipe-based flashcards that feel like a game, not homework",
          "Personalized review queue that resurfaces words you almost knew",
          "Built-in SAT practice questions to test recall in real test format",
          "XP, levels, and streaks to keep daily study consistent",
        ],
      },
      { type: "h2", text: "Why Swiping Beats Traditional Flashcards" },
      {
        type: "p",
        text: "Short, focused interactions reduce friction. When studying takes ten seconds to start, students study more often — and frequency is what drives long-term vocabulary retention. LearnLexiq's swipe motion creates a quick decision point that strengthens recall every single tap.",
      },
      { type: "h2", text: "Built for Real SAT Score Gains" },
      {
        type: "p",
        text: "Vocabulary still matters on the SAT Reading and Writing sections, especially in evidence-based questions and high-difficulty passages. LearnLexiq pairs the words with the contexts you'll actually encounter, so the words you learn translate directly into points on test day.",
      },
      { type: "h3", text: "Who LearnLexiq is for" },
      {
        type: "ul",
        items: [
          "High school students preparing for the SAT or ACT",
          "Students aiming to push from a mid-range score into the top percentile",
          "Anyone who wants to grow their vocabulary without painful study sessions",
        ],
      },
      { type: "h2", text: "Start Learning Today" },
      {
        type: "p",
        text: "Create a free account and start your first swipe session in under a minute. Consistency beats cramming — even a few minutes a day with LearnLexiq compounds into a stronger vocabulary and a higher SAT score.",
      },
    ],
  },
  {
    slug: "most-common-sat-vocabulary-words",
    title: "The Most Common SAT Vocabulary Words (And How to Actually Remember Them)",
    summary:
      "A focused list of the most common SAT vocabulary words that appear on the Reading and Writing sections, with definitions, examples, and a free way to practice them.",
    date: "2026-06-16",
    readMinutes: 6,
    content: [
      { type: "p", text: "If you're prepping for the SAT, you've probably noticed the same kinds of words show up over and over. The College Board doesn't publish an official word list, but after analyzing released exams, certain SAT vocabulary words appear with striking frequency on the Reading and Writing sections." },
      { type: "h2", text: "Why SAT Vocabulary Still Matters" },
      { type: "p", text: "Even with the digital SAT focusing more on context-based questions, knowing high-frequency vocabulary is one of the fastest ways to raise your score. Words like 'ambiguous,' 'pragmatic,' and 'undermine' show up directly in answer choices for Words in Context and Command of Evidence questions." },
      { type: "h2", text: "30 High-Frequency SAT Words to Know" },
      { type: "ul", items: [
        "Ambiguous — having more than one possible meaning",
        "Benevolent — kind and wanting to do good",
        "Candid — honest and straightforward",
        "Capricious — changing mood or behavior suddenly",
        "Concise — short and to the point",
        "Ephemeral — lasting only a very short time",
        "Loquacious — very talkative",
        "Malevolent — wanting to harm others",
        "Pragmatic — focused on practical results",
        "Scrutinize — to examine closely",
        "Tenacious — determined and persistent",
        "Ubiquitous — found everywhere",
        "Verbose — using too many words",
        "Abate — to lessen or reduce",
        "Aberration — something out of the ordinary",
        "Abhor — to hate strongly",
        "Acquiesce — to agree reluctantly",
        "Brevity — being short and to the point",
        "Coincide — to happen at the same time",
        "Elaborate — to explain in more detail",
        "Infer — to figure out from clues",
        "Redundant — unnecessarily repetitive",
        "Synthesize — to combine into a whole",
        "Austere — plain and strict",
        "Undermine — to weaken gradually",
        "Substantiate — to support with evidence",
        "Plausible — believable",
        "Mitigate — to make less severe",
        "Inevitable — certain to happen",
        "Profound — very deep or intense",
      ] },
      { type: "h2", text: "How to Memorize SAT Words That Actually Stick" },
      { type: "p", text: "Memorizing definitions cold is the slowest way to learn vocabulary. The fastest way is short, repeated exposure in context. That's exactly what LearnLexiq is built for — a swipe-based SAT vocabulary app that surfaces high-frequency words, tracks the ones you almost knew, and quizzes you on the words that matter most." },
      { type: "h3", text: "Three rules for retention" },
      { type: "ul", items: [
        "Study for 5 minutes a day instead of 60 minutes once a week — frequency beats volume.",
        "Always see the word in a sentence, not just a definition.",
        "Quiz yourself the next day on what you learned today.",
      ] },
      { type: "h2", text: "Practice These Words Free" },
      { type: "p", text: "Open LearnLexiq, pick SAT mode, and start swiping. Every word you mark as 'might forget' gets reintroduced automatically until you've mastered it — no flashcards required." },
    ],
  },
  {
    slug: "500-sat-words-you-should-know",
    title: "500 SAT Words You Should Know Before Test Day",
    summary:
      "A complete guide to building a 500-word SAT vocabulary list — what to study, how to space your reviews, and why context beats memorization.",
    date: "2026-06-17",
    readMinutes: 7,
    content: [
      { type: "p", text: "Most SAT prep books push 500–1,000 word lists, but raw lists don't work. The students who score in the top 10% don't memorize all 500 words at once — they learn them in small batches, spaced over weeks, and always inside example sentences." },
      { type: "h2", text: "How to Approach a 500-Word SAT List" },
      { type: "p", text: "Break the list into 20 batches of 25 words. Spend two days on each batch: one day learning, one day reviewing. By week four you've cycled through every word twice — far more effective than cramming." },
      { type: "h2", text: "Word Categories That Appear on the SAT" },
      { type: "ul", items: [
        "Tone words (caustic, sardonic, earnest, reverent)",
        "Argument words (substantiate, refute, concede, qualify)",
        "Change words (mitigate, exacerbate, undermine, bolster)",
        "Personality words (gregarious, taciturn, candid, capricious)",
        "Logic words (plausible, ambiguous, coherent, fallacious)",
      ] },
      { type: "h2", text: "Build Your List With LearnLexiq" },
      { type: "p", text: "LearnLexiq already organizes the top 500 SAT vocabulary words by root, frequency, and difficulty — so you don't have to. Track every word you've ever learned in your personal Word History, and let our spaced-repetition engine resurface anything you flagged as 'might forget.'" },
      { type: "h2", text: "Don't Just Memorize — Use the Words" },
      { type: "p", text: "Vocabulary you can actually use sticks. Write three sentences with each new word, or speak them out loud — LearnLexiq even gives you a natural AI voice pronunciation so the word feels real." },
    ],
  },
  {
    slug: "sat-vocabulary-guide",
    title: "The Complete SAT Vocabulary Guide for 2026",
    summary:
      "Everything you need to know about SAT vocabulary in 2026 — what's on the digital SAT, which words show up most, and how to study smart.",
    date: "2026-06-18",
    readMinutes: 6,
    content: [
      { type: "p", text: "The digital SAT has shifted how vocabulary is tested. There are no more isolated 'sentence completion' questions, but vocabulary still drives a major portion of the Reading and Writing module through Words in Context and tone-based questions." },
      { type: "h2", text: "What's Tested in 2026" },
      { type: "ul", items: [
        "Words in Context — choosing the best word for a passage",
        "Tone and Style — understanding the author's attitude",
        "Transition Logic — connectives like 'however,' 'consequently,' 'nevertheless'",
        "Command of Evidence — vocabulary in argument-based questions",
      ] },
      { type: "h2", text: "A Smart Study Plan" },
      { type: "ul", items: [
        "Week 1–2: Learn 15 new words per day with LearnLexiq",
        "Week 3: Review with a vocabulary checkpoint every 20 words",
        "Week 4: Take a full practice section, then re-study any missed words",
      ] },
      { type: "h2", text: "Why a Vocabulary App Beats a Paper List" },
      { type: "p", text: "Paper lists give you no feedback. LearnLexiq tracks every word you swipe, flags the ones you struggle with, and uses spaced repetition to make sure you never forget the hard ones." },
    ],
  },
  {
    slug: "act-vocabulary-guide",
    title: "ACT Vocabulary Guide: Words That Show Up on the English & Reading Sections",
    summary:
      "The ACT tests vocabulary differently from the SAT — here's exactly what to study and how to prep efficiently.",
    date: "2026-06-18",
    readMinutes: 5,
    content: [
      { type: "p", text: "ACT vocabulary isn't tested the same way as the SAT. Instead of dedicated word-in-context questions, the ACT slips vocabulary into Reading passages and English style/diction questions — so the words you need are the ones that affect tone, transition, and clarity." },
      { type: "h2", text: "ACT-Specific Word Types to Master" },
      { type: "ul", items: [
        "Transition words (consequently, furthermore, however, therefore)",
        "Diction-pair words (affect/effect, concise/redundant, infer/imply)",
        "Tone words used in literary passages",
        "Common SAT/ACT crossover words (ubiquitous, pragmatic, abate)",
      ] },
      { type: "h2", text: "How to Practice ACT Vocabulary in 10 Minutes a Day" },
      { type: "p", text: "Open LearnLexiq, switch to ACT mode in settings, and you'll see only words that show up on the ACT. Swipe right on the ones you know, left on the ones you don't, and let the app handle the rest." },
    ],
  },
  {
    slug: "hard-sat-words-explained",
    title: "Hard SAT Words Explained: Definitions, Examples, and Memory Tricks",
    summary:
      "A breakdown of the hardest SAT vocabulary words — what they mean, how they're used, and how to actually remember them.",
    date: "2026-06-18",
    readMinutes: 6,
    content: [
      { type: "p", text: "Some SAT words are genuinely hard. They look obscure, they're rarely used in everyday speech, and a paper flashcard can't really teach them. Below are ten of the hardest words that appear on the SAT, broken down clearly." },
      { type: "h2", text: "Hard Word Breakdown" },
      { type: "ul", items: [
        "Acquiesce — to agree reluctantly. Example: He acquiesced to her demands.",
        "Capricious — sudden, unpredictable change. Example: A capricious boss who changes plans hourly.",
        "Loquacious — extremely talkative. Example: Her loquacious uncle dominated dinner.",
        "Ephemeral — short-lived. Example: Cherry blossoms are ephemeral.",
        "Ubiquitous — everywhere at once. Example: Smartphones are ubiquitous.",
        "Aberration — something out of the norm. Example: A snowy day in July is an aberration.",
        "Austere — plain and strict. Example: The austere room had only a desk.",
        "Abate — to reduce. Example: The fever finally abated.",
        "Tenacious — refusing to give up. Example: A tenacious crab clings to a rock.",
        "Verbose — wordy. Example: His verbose emails are exhausting.",
      ] },
      { type: "h2", text: "Memory Tricks That Work" },
      { type: "p", text: "Tie hard words to root meanings (loqu = speak, bene = good, mal = bad) and to vivid mini-images. LearnLexiq does both automatically — root analysis is built into every card." },
    ],
  },
  {
    slug: "sat-word-of-the-day",
    title: "SAT Word of the Day: A Free Way to Build Vocabulary in 60 Seconds",
    summary:
      "Why a daily SAT word habit beats long study sessions, and how to build one with LearnLexiq.",
    date: "2026-06-18",
    readMinutes: 4,
    content: [
      { type: "p", text: "One of the simplest, cheapest, and most underrated SAT prep habits is the daily word. One word, one minute, every day. Over a school year, that's 365 high-leverage SAT vocabulary words." },
      { type: "h2", text: "Why Daily Beats Cramming" },
      { type: "p", text: "Memory research is consistent: spaced repetition over weeks wins every time over a one-night cram. Daily exposure also keeps SAT-style language familiar, so test day feels like just another swipe session." },
      { type: "h2", text: "Make LearnLexiq Your Word of the Day" },
      { type: "p", text: "Set a daily goal of one word, ten words, or thirty — whatever fits your schedule. LearnLexiq celebrates when you hit your goal and quietly tracks every word in your Word History so you can review anything you flagged." },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
