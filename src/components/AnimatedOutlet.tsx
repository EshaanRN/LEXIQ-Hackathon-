import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/**
 * Wraps <Outlet /> with a lightweight CSS fade/slide so navigating between
 * tabs (Swipe → Test → Stats → Avatar → Shop) animates in instead of
 * flashing blank. No framer-motion — pure Tailwind keyframes for perf.
 */
export function AnimatedOutlet() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [key, setKey] = useState(pathname);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setKey(pathname);
  }, [pathname]);

  return (
    <div
      key={key}
      className="animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out will-change-[opacity,transform]"
    >
      <Outlet />
    </div>
  );
}
