/** Clean full-screen loader used during auth → app handoff. CSS-only (no framer-motion). */
export function LoadingScreen({ message = "Loading your account…" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
      <div className="grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.04] animate-in zoom-in-75 fade-in duration-300">
        <span className="font-display text-3xl font-black text-white">Lx</span>
      </div>
      <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 rounded-full bg-white loading-bar-slide" />
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.3em] text-white/60">{message}</p>
      <style>{`
        @keyframes loading-bar-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .loading-bar-slide {
          animation: loading-bar-slide 1.1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
