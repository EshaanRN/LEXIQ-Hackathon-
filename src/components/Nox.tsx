import { motion, AnimatePresence } from "framer-motion";
import owlAsset from "@/assets/lexiq-owl-transparent.png.asset.json";

const owlSrc = owlAsset.url;

export type NoxMood = "idle" | "happy" | "encourage" | "thinking" | "excited";

const moodAnim: Record<NoxMood, { y: number[]; rotate: number[]; duration: number }> = {
  idle:      { y: [0, -6, 0],   rotate: [-2, 2, -2],   duration: 3.2 },
  thinking:  { y: [0, -3, 0],   rotate: [-6, 6, -6],   duration: 2.4 },
  happy:     { y: [0, -14, 0],  rotate: [-8, 8, -8],   duration: 0.6 },
  excited:   { y: [0, -18, 0, -10, 0], rotate: [0, -12, 12, -8, 0], duration: 0.7 },
  encourage: { y: [0, -4, 0],   rotate: [-3, 3, -3],   duration: 1.6 },
};

const haloByMood: Record<NoxMood, string> = {
  idle:      "bg-primary/30",
  thinking:  "bg-accent/30",
  happy:     "bg-emerald-400/50",
  excited:   "bg-amber-400/50",
  encourage: "bg-rose-400/40",
};

export function Nox({
  message,
  mood = "idle",
  size = 96,
}: {
  message?: string;
  mood?: NoxMood;
  size?: number;
}) {
  const a = moodAnim[mood];
  return (
    <div className="flex items-end gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <motion.span
          aria-hidden
          className={`absolute inset-0 rounded-full blur-2xl ${haloByMood[mood]}`}
          animate={{ scale: mood === "happy" || mood === "excited" ? [1, 1.35, 1] : [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: mood === "happy" ? 0.6 : 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={owlSrc}
          alt="Nox the owl"
          className="relative h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(124,92,255,0.45)]"
          animate={{ y: a.y, rotate: a.rotate }}
          transition={{ duration: a.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, x: -8, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="relative mb-2 max-w-[220px] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-sm shadow-lg"
          >
            <span
              aria-hidden
              className="absolute -left-1.5 bottom-3 h-3 w-3 rotate-45 border-b border-l border-border bg-card"
            />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
