import { motion } from "framer-motion";

/** Clean full-screen loader used during auth → app handoff. */
export function LoadingScreen({ message = "Loading your account…" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.04]"
      >
        <span className="font-display text-3xl font-black text-white">Lx</span>
      </motion.div>
      <motion.div
        className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <motion.div
          className="h-full w-1/3 rounded-full bg-white"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <p className="mt-5 text-xs uppercase tracking-[0.3em] text-white/60">{message}</p>
    </div>
  );
}
