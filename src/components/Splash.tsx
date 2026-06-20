import { motion } from "framer-motion";
import owlAsset from "@/assets/lexiq-owl-transparent.png.asset.json";

/** TikTok-style splash: black bg, animated owl reveal, particles. */
export function Splash({ tagline = "Swipe. Learn. Level up." }: { tagline?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: Math.cos((i / 18) * Math.PI * 2) * 180,
            y: Math.sin((i / 18) * Math.PI * 2) * 180,
            opacity: [0, 1, 0],
            scale: [0, 1.4, 0.6],
          }}
          transition={{ delay: 0.35 + i * 0.015, duration: 1.2, ease: "easeOut" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.6, 1] }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="absolute -inset-4 -z-10 rounded-full bg-primary/50 blur-3xl"
          />
          <motion.img
            src={owlAsset.url}
            alt="Lexiq owl mascot"
            className="h-40 w-40 object-contain"
            animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 12px 24px rgba(124,58,237,0.55))" }}
          />
        </div>

        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="mt-6 font-display text-4xl font-bold tracking-tight text-white"
        >
          Lexiq
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.75, duration: 0.35 }}
          className="mt-2 text-xs uppercase tracking-[0.4em] text-white/60"
        >
          {tagline}
        </motion.p>
      </motion.div>
    </div>
  );
}
