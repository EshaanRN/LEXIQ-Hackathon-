import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Preload route chunks on hover/touch so bottom-nav taps feel instant.
    defaultPreload: "intent",
    defaultPreloadDelay: 20,
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 0,
    defaultPendingMinMs: 180,
    defaultViewTransition: true,
  });

  return router;
};
