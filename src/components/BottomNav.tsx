import { Link } from "@tanstack/react-router";
import { Layers, ShoppingBag, User } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 mx-auto w-full max-w-md border-t border-border bg-background/80 px-6 py-3 backdrop-blur">
      <div className="flex items-center justify-around">
        <NavLink to="/app" icon={<Layers className="h-5 w-5" />} label="Swipe" />
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
      className="flex flex-col items-center gap-1 text-muted-foreground transition hover:text-foreground"
      activeProps={{ className: "text-primary" }}
    >
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
    </Link>
  );
}
