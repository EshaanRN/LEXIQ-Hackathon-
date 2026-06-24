import { Dumbbell } from "lucide-react";

/**
 * House ad for Axiom — upcoming free adaptive fitness + diet app.
 * Muted purple/surface theme so it sits quietly inside the app
 * without out-shouting the flashcards.
 */
export function AxiomAd({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="https://axiom.app"
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`group relative flex h-full w-full items-center overflow-hidden text-white/90 ${
        compact ? "gap-2.5 px-3 py-2" : "flex-col justify-center gap-1.5 p-3 text-center"
      }`}
      style={{
        background:
          "linear-gradient(135deg, hsl(260 28% 12%) 0%, hsl(265 32% 18%) 55%, hsl(270 38% 24%) 100%)",
      }}
    >
      {/* soft accent glow — kept low-opacity so it blends */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.18),transparent_65%)]" />

      <span
        className={`relative grid place-items-center rounded-lg bg-purple-500/25 text-purple-100 ring-1 ring-white/10 ${
          compact ? "h-7 w-7 shrink-0" : "h-9 w-9"
        }`}
      >
        <Dumbbell className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
      </span>

      <div
        className={`relative ${compact ? "min-w-0 flex-1 text-left" : "flex flex-col items-center"}`}
      >
        <div className={`flex items-center gap-1.5 ${compact ? "" : "justify-center"}`}>
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            Axiom
          </span>
          <span className="rounded-full bg-white/10 px-1.5 py-[1px] text-[8px] font-semibold uppercase tracking-widest text-white/80 ring-1 ring-white/15">
            Free
          </span>
        </div>
        <p
          className={`text-[10px] text-white/65 ${compact ? "truncate" : "mt-0.5 max-w-[36ch]"}`}
        >
          Adaptive fitness + personalized diet.
        </p>
      </div>

      <span
        className={`relative whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-white/90 ring-1 ring-white/15 transition group-hover:bg-white/15 ${
          compact ? "shrink-0" : "mt-1"
        }`}
      >
        Soon
      </span>
    </a>
  );
}
