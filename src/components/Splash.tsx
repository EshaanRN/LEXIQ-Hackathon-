import { motion } from "framer-motion";

/** TikTok-style splash: black bg, animated logo reveal, particles. */
export function Splash({ tagline = "Swipe. Learn. Level up." }: { tagline?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      {/* particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: Math.cos((i / 18) * Math.PI * 2) * 180,
            y: Math.sin((i / 18) * Math.PI * 2) * 180,
            opacity: [0, 1, 0],
            scale: [0, 1.4, 0.6],
          }}
          transition={{ delay: 0.6 + i * 0.02, duration: 1.4, ease: "easeOut" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <div
          className="relative grid h-28 w-28 place-items-center rounded-3xl glow-primary"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
        >
          <motion.span
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="font-display text-5xl font-black text-primary-foreground"
          >
            SS
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.6, 1] }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -inset-1 -z-10 rounded-3xl bg-primary/30 blur-2xl"
          />
        </div>

        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-6 font-display text-3xl font-bold tracking-tight text-white"
        >
          SAT Swipe
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="mt-2 text-xs uppercase tracking-[0.4em] text-white/60"
        >
          {tagline}
        </motion.p>
      </motion.div>
    </div>
  );
}
