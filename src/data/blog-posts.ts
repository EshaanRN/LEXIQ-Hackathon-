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
