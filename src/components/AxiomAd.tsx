import { Dumbbell, Apple, Activity, Sparkles, ArrowRight } from "lucide-react";

/**
 * House ad for Axiom — upcoming free adaptive fitness + diet app.
 * Two variants:
 *  - compact: short horizontal banner used in AdSlot banner (h-72ish)
 *  - full:    richer ad card with feature pills + CTA
 */
export function AxiomAd({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="https://axiom.app"
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label="Axiom — free adaptive fitness and diet app"
      className={`group relative block h-full w-full overflow-hidden text-white ${compact ? "" : "p-4"}`}
      style={{
        background:
          "linear-gradient(135deg, hsl(258 35% 10%) 0%, hsl(265 40% 16%) 50%, hsl(275 55% 22%) 100%)",
      }}
    >
      {/* Decorative aurora */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {compact ? (
        <div className="relative flex h-full w-full items-center gap-3 px-3 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-500/40 to-fuchsia-500/30 ring-1 ring-white/15">
            <Dumbbell className="h-4 w-4 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-[15px] font-bold tracking-tight">Axiom</span>
              <span className="rounded-full bg-emerald-400/20 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-widest text-emerald-200 ring-1 ring-emerald-300/30">
                Free
              </span>
              <span className="rounded-full bg-white/10 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-widest text-white/75 ring-1 ring-white/15">
                Soon
              </span>
            </div>
            <p className="truncate text-[10.5px] text-white/70">
              Adaptive workouts · personalized diet · for kids & adults.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-widest text-purple-900 shadow-md transition group-hover:scale-[1.03]">
            Notify me <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      ) : (
        <div className="relative flex h-full w-full flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-purple-500/50 to-fuchsia-500/40 ring-1 ring-white/15">
                <Dumbbell className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="font-display text-base font-bold leading-none tracking-tight">Axiom</p>
                <p className="text-[9px] uppercase tracking-widest text-white/55">Coming soon</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-200 ring-1 ring-emerald-300/30">
              100% Free
            </span>
          </div>

          <h3 className="mt-3 font-display text-[15px] font-bold leading-tight text-white">
            Your AI fitness <span className="bg-gradient-to-r from-fuchsia-300 to-purple-200 bg-clip-text text-transparent">& diet coach.</span>
          </h3>
          <p className="mt-1 text-[10.5px] leading-snug text-white/65">
            Adaptive workouts and personalized meal plans — built for kids and adults.
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill icon={<Activity className="h-2.5 w-2.5" />} label="Adaptive" />
            <Pill icon={<Apple className="h-2.5 w-2.5" />} label="Diet" />
            <Pill icon={<Sparkles className="h-2.5 w-2.5" />} label="AI" />
          </div>

          <div className="mt-auto pt-3">
            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-purple-900 shadow-md transition group-hover:scale-[1.02]">
              Get early access <ArrowRight className="h-3 w-3" />
            </span>
            <p className="mt-1.5 text-center text-[8.5px] uppercase tracking-widest text-white/40">Sponsored</p>
          </div>
        </div>
      )}
    </a>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/85 ring-1 ring-white/15">
      {icon}
      {label}
    </span>
  );
}
