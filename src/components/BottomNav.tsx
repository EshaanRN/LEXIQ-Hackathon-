import { Link, useRouterState } from "@tanstack/react-router";
import { Layers, ShoppingBag, Target, BarChart3, History, User, MessageCircle } from "lucide-react";
import owlAsset from "@/assets/lexiq-owl-transparent.png.asset.json";

const owl = owlAsset.url;

export function BottomNav() {
  const isTransitioning = useRouterState({ select: (s) => s.isLoading || s.isTransitioning });
  const onCoach = useRouterState({ select: (s) => s.location.pathname.startsWith("/coach") });

  return (
    <>
      {!onCoach && (
        <Link
          to="/coach"
          preload="intent"
          aria-label="Ask Nox about a word"
          className="fixed bottom-28 right-3 z-40 flex items-center gap-2 rounded-full border border-primary/40 bg-card/90 py-2 pl-2 pr-4 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-primary active:scale-95 mb-[env(safe-area-inset-bottom)]"
        >
          <img src={owl} alt="" className="h-7 w-7 object-contain" />
          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-primary">
            Ask Nox
          </span>
          <MessageCircle className="h-3.5 w-3.5 text-primary" />
        </Link>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-2xl border-t border-border bg-background/85 px-2 py-2 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          <NavLink to="/app" icon={<Layers className="h-5 w-5" />} label="Swipe" disabled={isTransitioning} />
          <NavLink to="/checkpoint" icon={<Target className="h-5 w-5" />} label="Test" disabled={isTransitioning} />
          <NavLink to="/history" icon={<History className="h-5 w-5" />} label="History" disabled={isTransitioning} />
          <NavLink to="/dashboard" icon={<BarChart3 className="h-5 w-5" />} label="Stats" disabled={isTransitioning} />
          <NavLink to="/shop" icon={<ShoppingBag className="h-5 w-5" />} label="Shop" disabled={isTransitioning} />
          <NavLink to="/avatar" icon={<User className="h-5 w-5" />} label="Profile" disabled={isTransitioning} />
        </div>
      </nav>
    </>
  );
}


function NavLink({ to, icon, label, disabled }: { to: string; icon: React.ReactNode; label: string; disabled: boolean }) {
  return (
    <Link
      to={to}
      preload="intent"
      preloadDelay={20}
      viewTransition
      disabled={disabled}
      className="group relative flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-muted-foreground transition-all duration-200 ease-out hover:text-foreground hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
      activeProps={{
        className:
          "text-primary [&_span]:text-primary before:absolute before:-top-2 before:left-1/2 before:h-1 before:w-6 before:-translate-x-1/2 before:rounded-full before:bg-primary before:shadow-[0_0_12px_var(--color-primary)] before:animate-in before:fade-in before:zoom-in-75 before:duration-200",
      }}
    >
      <span className="transition-transform duration-200 ease-out group-hover:scale-110 group-active:scale-95">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest transition-colors">{label}</span>
    </Link>
  );
}
