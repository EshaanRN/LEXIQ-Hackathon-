import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_POSTS, formatPostDate } from "@/data/blog-posts";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
  head: () => ({
    meta: [
      { title: "Lexiq Blog — SAT Vocabulary Tips & Study Strategies" },
      {
        name: "description",
        content:
          "Insights, study strategies, and SAT vocabulary tips from the Lexiq team. Learn how to master high-frequency SAT and ACT words faster.",
      },
      { property: "og:title", content: "Lexiq Blog — SAT Vocabulary Tips & Study Strategies" },
      {
        property: "og:description",
        content:
          "Insights, study strategies, and SAT vocabulary tips from the Lexiq team.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://learnlexiq.com/blog" },
    ],
    links: [{ rel: "canonical", href: "https://learnlexiq.com/blog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Lexiq Blog",
          url: "https://learnlexiq.com/blog",
          description:
            "SAT vocabulary tips, study strategies, and product updates from Lexiq.",
        }),
      },
    ],
  }),
});

function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-xs uppercase tracking-widest text-white/60 hover:text-white">
          ← Back to Lexiq
        </Link>
        <header className="mt-6">
          <h1 className="font-display text-4xl font-bold tracking-tight">The Lexiq Blog</h1>
          <p className="mt-3 text-base text-white/70">
            SAT vocabulary tips, study strategies, and ideas to help students learn faster.
          </p>
        </header>

        <section className="mt-10 space-y-4">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="block"
              >
                <p className="text-xs uppercase tracking-widest text-white/50">
                  {formatPostDate(post.date)} · {post.readMinutes} min read
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{post.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-widest text-white/60">
                  Read post →
                </p>
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
