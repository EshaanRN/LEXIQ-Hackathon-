import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

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
  component: LandingPage,
});
