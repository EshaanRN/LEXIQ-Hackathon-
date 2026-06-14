import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogOut, FileText, Check } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { XPToast } from "@/components/XPToast";
import { clearState, setAvatar, useGame } from "@/lib/game-store";
import { PRESET_AVATARS } from "@/lib/avatar";
import { supabase } from "@/integrations/supabase/client";
import { AvatarBuilder } from "@/routes/_authenticated/onboarding";

export const Route = createFileRoute("/_authenticated/avatar")({
  ssr: false,
  component: AvatarPage,
});

function AvatarPage() {
  const g = useGame();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("sign out failed", e);
    }
    try {
      sessionStorage.removeItem("lexiq:splash-shown");
    } catch {}
    clearState();
    navigate({ to: "/auth", replace: true });
  }

  const ownedPresets = PRESET_AVATARS.filter((p) => g.ownedItems.includes(p.id));
  const equippedSig = `${g.avatar.style}|${g.avatar.seed}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app" aria-label="Back to app" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Your Avatar</h1>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <Avatar equipped={g.avatar} size={140} />
        <p className="mt-3 font-display text-lg font-bold">{g.username ?? "Player"}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{g.rank}</p>
      </div>

      <div className="mt-2">
        <AvatarBuilder avatar={g.avatar} setAvatar={setAvatar} owned={g.ownedItems} />
      </div>

      {ownedPresets.length > 0 && (
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Presets</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ownedPresets.map((p) => {
              const active = equippedSig === `${p.style}|${p.seed}`;
              return (
                <button
                  key={p.id}
                  onClick={() =>
                    setAvatar({ style: p.style, seed: p.seed, backgroundColor: p.backgroundColor, radius: 50 })
                  }
                  className={`flex flex-col items-center gap-1 rounded-2xl p-2 ring-1 transition ${
                    active ? "ring-primary bg-primary/15 glow-primary" : "ring-border bg-surface-2"
                  }`}
                >
                  <Avatar equipped={{ style: p.style, seed: p.seed, backgroundColor: p.backgroundColor }} size={56} />
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest">
                    {active && <Check className="h-3 w-3 text-primary" />}
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Link
        to="/shop"
        className="mt-6 block w-full rounded-full bg-primary py-3 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary"
      >
        Open Shop
      </Link>

      <div className="mt-8 rounded-2xl bg-surface-2 ring-1 ring-border">
        <p className="px-4 pt-4 text-[10px] uppercase tracking-widest text-muted-foreground">Account</p>
        <Link
          to="/terms"
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-surface"
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
          Terms & Privacy Policy
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </div>

      <XPToast />
    </main>
  );
}
