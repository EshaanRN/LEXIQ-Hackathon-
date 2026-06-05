import { Link } from "@tanstack/react-router";
import { Layers, ShoppingBag, User, Target, BarChart3 } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-2xl border-t border-border bg-background/85 px-4 py-2 backdrop-blur-xl">
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
    <Link to={to}
      className="flex flex-col items-center gap-1 text-muted-foreground transition hover:text-foreground"
      activeProps={{ className: "text-primary" }}>
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
    </Link>
  );
}
