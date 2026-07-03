import { Dumbbell, Apple, Activity, Sparkles, ArrowRight, Star, ShieldCheck } from "lucide-react";

/**
 * House ad for Axiom — upcoming free adaptive fitness + diet app.
 * Designed to feel like a polished Google Display / responsive ad unit:
 *  - Clear brand block (icon + name + verified check + "Ad" tag)
 *  - Headline + short descriptor
 *  - Visible star rating + social proof
 *  - Big high-contrast CTA button with arrow
 *  - "Why this ad?" style meta row at the bottom
 */
export function AxiomAd({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="https://axiom.app"
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label="Axiom — free adaptive fitness and diet app"
      className={`group relative block h-full w-full overflow-hidden bg-white text-slate-900 ${compact ? "" : ""}`}
    >
      {/* subtle backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-purple-50/60" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-fuchsia-400/20 blur-3xl" />

      {compact ? (
        <div className="relative flex h-full w-full items-center gap-3 px-3 py-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-md ring-1 ring-black/5">
            <Dumbbell className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate font-sans text-[13px] font-bold tracking-tight text-slate-900">Axiom Fitness</span>
              <ShieldCheck className="h-3 w-3 shrink-0 text-blue-500" aria-label="Verified advertiser" />
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-semibold text-emerald-600">Free</span>
              <span className="text-[10px] text-slate-400">·</span>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3].map((i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                ))}
                <Star className="h-2.5 w-2.5 fill-amber-400/50 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-500">4.8 · 12k+</span>
            </div>
            <p className="mt-0.5 truncate text-[10.5px] text-slate-600">
              AI workouts & meal plans built around your day. Kids & adults.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition group-hover:bg-blue-700">
            Install <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      ) : (
        <div className="relative flex h-full w-full flex-col p-4">
          {/* Header row — advertiser identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-md ring-1 ring-black/5">
                <Dumbbell className="h-5 w-5 text-white" strokeWidth={2.5} />
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <p className="font-sans text-[15px] font-bold text-slate-900">Axiom Fitness</p>
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" aria-label="Verified advertiser" />
                </div>
                <p className="text-[10px] text-slate-500">axiom.app · Health & Fitness</p>
              </div>
            </div>
            <span className="rounded-sm bg-slate-100 px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
              Ad
            </span>
          </div>

          {/* Headline */}
          <h3 className="mt-3 font-display text-[17px] font-extrabold leading-[1.15] tracking-tight text-slate-900">
            Your AI fitness &amp; diet coach — <span className="text-purple-700">free forever.</span>
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-slate-600">
            Adaptive workouts. Personalized meals. Built for kids and adults, in one clean app.
          </p>

          {/* Rating row */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
              <Star className="h-3 w-3 fill-amber-400/60 text-amber-400" />
            </div>
            <span className="text-[10.5px] font-semibold text-slate-700">4.8</span>
            <span className="text-[10.5px] text-slate-500">· 12,400 reviews · Editors' Pick</span>
          </div>

          {/* Feature pills */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill icon={<Activity className="h-2.5 w-2.5" />} label="Adaptive" />
            <Pill icon={<Apple className="h-2.5 w-2.5" />} label="Meal Plans" />
            <Pill icon={<Sparkles className="h-2.5 w-2.5" />} label="AI Coach" />
          </div>

          {/* CTA */}
          <div className="mt-auto pt-3">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 font-sans text-[12px] font-bold text-white shadow-sm transition group-hover:bg-blue-700">
              Get the app — Free <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <p className="mt-1.5 text-center text-[9px] text-slate-400">
              Sponsored · Why this ad?
            </p>
          </div>
        </div>
      )}
    </a>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-700 ring-1 ring-slate-200">
      {icon}
      {label}
    </span>
  );
}
