import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { applyProfile, clearState, loadStateForUser } from "@/lib/game-store";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const ADSENSE_CLIENT = "ca-pub-2551071845015039";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Lexiq | SAT & ACT Vocabulary Learning App" },
      { name: "description", content: "Lexiq helps students master SAT and ACT vocabulary using smart flashcards, memory tools, and personalized learning designed to improve test scores." },
      { name: "theme-color", content: "#000000" },
      { name: "google-site-verification", content: "C27DsJKIfRUqq1__dKiX434nkLMTf6r1BnhRRpbcO9A" },
      ...(ADSENSE_CLIENT ? [{ name: "google-adsense-account", content: ADSENSE_CLIENT }] : []),
      { property: "og:site_name", content: "Lexiq" },
      { property: "og:title", content: "Lexiq | SAT & ACT Vocabulary Learning App" },
      { property: "og:description", content: "Lexiq helps students master SAT and ACT vocabulary using smart flashcards, memory tools, and personalized learning designed to improve test scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lexiq | SAT & ACT Vocabulary Learning App" },
      { name: "twitter:description", content: "Lexiq helps students master SAT and ACT vocabulary using smart flashcards, memory tools, and personalized learning designed to improve test scores." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/W3lAJc7pXvaPaEQVGvhEyATsQaz1/social-images/social-1781376513010-ECCD4186-0761-4804-9F8D-9AEF5CEECC02.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/W3lAJc7pXvaPaEQVGvhEyATsQaz1/social-images/social-1781376513010-ECCD4186-0761-4804-9F8D-9AEF5CEECC02.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon-512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      // Fonts are self-hosted via @fontsource (imported in src/styles.css) — no Google Fonts round-trip.
    ],
    scripts: [
      ...(ADSENSE_CLIENT
        ? [{
            async: true,
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
            crossOrigin: "anonymous",
          } as const]
        : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Lexiq",
          url: "https://learnlexiq.com",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Lexiq",
          url: "https://learnlexiq.com",
          logo: "https://learnlexiq.com/favicon.ico",
          description: "Lexiq turns SAT and ACT vocabulary into an addictive swipe game so students learn high-frequency words faster.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBridge />
      <PaymentTestModeBanner />
      <Outlet />
    </QueryClientProvider>
  );
}


function AuthBridge() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    let cancelled = false;
    async function hydrate(userId: string) {
      loadStateForUser(userId);
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (cancelled || !data) return;
      applyProfile({
        username: data.username,
        avatar: (data.equipped ?? data.avatar) as never,
        owned_items: data.owned_items ?? [],
        xp: data.xp ?? 0,
        coins: data.coins ?? 0,
        level: data.level ?? 1,
      });
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) hydrate(data.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (session?.user) {
        hydrate(session.user.id);
      } else {
        clearState();
      }
      router.invalidate();
      if (event !== "SIGNED_OUT") qc.invalidateQueries();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, qc]);
  return null;
}
