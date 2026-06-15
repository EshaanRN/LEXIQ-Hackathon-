import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BLOG_POSTS, formatPostDate, getPostBySlug, type BlogBlock } from "@/data/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: BlogPostPage,
  head: ({ params, loaderData }) => {
    const post = loaderData?.post ?? getPostBySlug(params.slug);
    const url = `https://learnlexiq.com/blog/${params.slug}`;
    if (!post) {
      return {
        meta: [{ title: "Post not found · Lexiq Blog" }],
        links: [{ rel: "canonical", href: url }],
      };
    }
    return {
      meta: [
        { title: `${post.title} · Lexiq Blog` },
        { name: "description", content: post.summary },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.date },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.summary },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.summary,
            datePublished: post.date,
            dateModified: post.date,
            author: { "@type": "Organization", name: "Lexiq" },
            publisher: {
              "@type": "Organization",
              name: "Lexiq",
              logo: { "@type": "ImageObject", url: "https://learnlexiq.com/favicon.ico" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
          }),
        },
      ],
    };
  },
  notFoundComponent: PostNotFound,
});

function PostNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-bold">Post not found</h1>
        <p className="mt-2 text-sm text-white/60">This blog post doesn't exist or was moved.</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Back to the blog
        </Link>
      </div>
    </main>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <article className="mx-auto max-w-2xl">
        <Link to="/blog" className="text-xs uppercase tracking-widest text-white/60 hover:text-white">
          ← All posts
        </Link>

        <header className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/50">
            {formatPostDate(post.date)} · {post.readMinutes} min read
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">{post.summary}</p>
        </header>

        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-white/85">
          {post.content.map((block: BlogBlock, i: number) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>

        {related.length > 0 && (
          <aside className="mt-16 border-t border-white/10 pt-8">
            <h2 className="font-display text-lg font-bold text-white">More posts</h2>
            <ul className="mt-4 space-y-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="text-sm text-white/80 hover:text-white"
                  >
                    {p.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </main>
  );
}

function BlockRenderer({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-4 font-display text-2xl font-bold text-white">{block.text}</h2>;
    case "h3":
      return <h3 className="mt-2 font-display text-lg font-bold text-white">{block.text}</h3>;
    case "p":
      return <p>{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5 marker:text-white/40">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "link":
      return (
        <p>
          <a
            href={block.href}
            className="text-white underline underline-offset-4 hover:text-white/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {block.text}
          </a>
        </p>
      );
  }
}
