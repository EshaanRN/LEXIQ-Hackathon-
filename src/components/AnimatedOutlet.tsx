import { Outlet } from "@tanstack/react-router";

export function AnimatedOutlet() {
  return (
    <div className="route-stage">
      <Outlet />
    </div>
  );
}

