import { Dumbbell } from "lucide-react";

/**
 * House ad for Axiom — upcoming free adaptive fitness + diet app.
 * Purple/black theme with white text.
 */
export function AxiomAd({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="https://axiom.app"
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`group relative flex h-full w-full items-center overflow-hidden text-white ${
        compact ? "gap-3 px-3 py-2" : "flex-col justify-center gap-1.5 p-3 text-center"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 45%, #4c1d95 100%)",
      }}
    >
      {/* glow accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.35),transparent_60%)]" />

      <span
        className={`relative grid place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-900/50 ${
          compact ? "h-8 w-8 shrink-0" : "h-9 w-9"
        }`}
      >
        <Dumbbell className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>

      <div
        className={`relative ${compact ? "min-w-0 flex-1 text-left" : "flex flex-col items-center"}`}
      >
        <div className={`flex items-center gap-1.5 ${compact ? "" : "justify-center"}`}>
          <span className="font-display text-base font-extrabold tracking-tight text-white">
            Axiom
          </span>
          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white ring-1 ring-white/30">
            Free
          </span>
        </div>
        <p
          className={`text-[10px] text-white/80 ${compact ? "truncate" : "mt-0.5 max-w-[36ch]"}`}
        >
          Adaptive fitness + personalized diet — kids & adults.
        </p>
      </div>

      <span
        className={`relative whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-purple-900 transition group-hover:scale-105 ${
          compact ? "shrink-0" : "mt-1"
        }`}
      >
        Coming Soon
      </span>
    </a>
  );
}
