import { Dumbbell, Apple, Sparkles } from "lucide-react";

/**
 * House ad for Axiom — an upcoming free, adaptive personal fitness +
 * personalized diet app for kids and adults. Shown when no live ad network
 * unit is available so we always promote something instead of a blank slot.
 */
export function AxiomAd({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="https://axiom.app"
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden p-4 text-center"
    >
      {/* gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.25),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay [background-image:linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.06)_50%,transparent_100%)]" />

      <div className="relative flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30">
          <Dumbbell className="h-4 w-4" />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
          Axiom
        </span>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/40">
          Free
        </span>
      </div>

      {!compact && (
        <p className="relative max-w-[42ch] text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Adaptive fitness + personalized diet
        </p>
      )}
      <p className="relative max-w-[44ch] text-xs text-foreground/80">
        Interactive workouts and meal plans built for{" "}
        <span className="font-bold text-foreground">kids and adults</span> — adapts to you every day.
      </p>

      {!compact && (
        <div className="relative mt-1 flex flex-wrap items-center justify-center gap-1.5">
          <Tag icon={<Dumbbell className="h-3 w-3" />} label="Adaptive" />
          <Tag icon={<Apple className="h-3 w-3" />} label="Diet" />
          <Tag icon={<Sparkles className="h-3 w-3" />} label="Personalized" />
        </div>
      )}

      <span className="relative mt-1 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background transition group-hover:scale-105">
        Coming Soon — Get Notified
      </span>
    </a>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-foreground/80 ring-1 ring-border">
      {icon}
      {label}
    </span>
  );
}
