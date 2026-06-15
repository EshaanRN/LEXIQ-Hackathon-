import { Outlet, useRouterState } from "@tanstack/react-router";

/**
 * Wraps <Outlet /> with a very subtle crossfade keyed to pathname.
 * No slide, no transform — just a fast opacity fade so tab changes
 * feel instant instead of "animating in".
 */
export function AnimatedOutlet() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="animate-page-fade">
      <Outlet />
    </div>
  );
}

