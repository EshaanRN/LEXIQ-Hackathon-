import { Link } from "@tanstack/react-router";
import { Layers, ShoppingBag, User, Target, BarChart3 } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-2xl border-t border-border bg-background/85 px-4 py-2 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        <NavLink to="/app" icon={<Layers className="h-5 w-5" />} label="Swipe" />
        <NavLink to="/checkpoint" icon={<Target className="h-5 w-5" />} label="Test" />
        <NavLink to="/dashboard" icon={<BarChart3 className="h-5 w-5" />} label="Stats" />
        <NavLink to="/avatar" icon={<User className="h-5 w-5" />} label="Avatar" />
        <NavLink to="/shop" icon={<ShoppingBag className="h-5 w-5" />} label="Shop" />
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      preload="intent"
      preloadDelay={20}
      className="group relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-muted-foreground transition-all duration-150 hover:text-foreground hover:-translate-y-0.5 active:scale-90"
      activeProps={{
        className:
          "text-primary [&_span]:text-primary before:absolute before:-top-2 before:left-1/2 before:h-1 before:w-6 before:-translate-x-1/2 before:rounded-full before:bg-primary before:shadow-[0_0_12px_var(--color-primary)] before:animate-in before:fade-in before:zoom-in-75 before:duration-200",
      }}
    >
      <span className="transition-transform duration-150 group-hover:scale-110 group-active:scale-95">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest transition-colors">{label}</span>
    </Link>
  );
}
