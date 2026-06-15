import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Preload route chunks on hover/touch so bottom-nav taps feel instant
    // instead of flashing blank while the chunk downloads.
    defaultPreload: "intent",
    defaultPreloadDelay: 30,
    defaultPreloadStaleTime: 0,
    // Keep the previous page on screen for up to 200ms while the next one
    // loads — eliminates the white flash between nav tabs.
    defaultPendingMs: 200,
    defaultPendingMinMs: 0,
  });

  return router;
};
