import { motion, AnimatePresence } from "framer-motion";
import owlAsset from "@/assets/lexiq-owl-transparent.png.asset.json";

const owlSrc = owlAsset.url;

export type NoxMood = "idle" | "happy" | "encourage" | "thinking" | "excited";

// Body motion per mood — tuned to feel alive, not jumpy.
const bodyAnim: Record<NoxMood, { y: number[]; rotate: number[]; duration: number }> = {
  idle:      { y: [0, -4, 0, -2, 0],    rotate: [-2, 1.5, -1, 2, -2],   duration: 4.0 },
  thinking:  { y: [0, -2, 0, -3, 0],    rotate: [-5, 4, -6, 3, -5],     duration: 2.8 },
  happy:     { y: [0, -16, -4, -12, 0], rotate: [-8, 6, -4, 8, 0],      duration: 0.9 },
  excited:   { y: [0, -20, -2, -14, 0], rotate: [-12, 12, -8, 10, 0],   duration: 0.75 },
  encourage: { y: [0, -3, 0, -2, 0],    rotate: [-2, 3, -2, 3, -2],     duration: 2.2 },
};

// Wing-flap simulated by horizontal squash. Bigger amplitude when excited.
const wingAnim: Record<NoxMood, { scaleX: number[]; scaleY: number[]; duration: number }> = {
  idle:      { scaleX: [1, 1.03, 0.98, 1.02, 1], scaleY: [1, 0.98, 1.02, 0.99, 1], duration: 3.2 },
  thinking:  { scaleX: [1, 1.02, 1, 0.99, 1],    scaleY: [1, 0.99, 1.01, 1, 1],    duration: 2.6 },
  happy:     { scaleX: [1, 1.18, 0.9, 1.12, 1],  scaleY: [1, 0.88, 1.1, 0.94, 1],  duration: 0.5 },
  excited:   { scaleX: [1, 1.25, 0.85, 1.18, 1], scaleY: [1, 0.82, 1.15, 0.9, 1],  duration: 0.4 },
  encourage: { scaleX: [1, 1.06, 0.97, 1.04, 1], scaleY: [1, 0.97, 1.03, 0.98, 1], duration: 1.8 },
};

const haloByMood: Record<NoxMood, string> = {
  idle:      "bg-primary/30",
  thinking:  "bg-accent/40",
  happy:     "bg-emerald-400/50",
  excited:   "bg-amber-400/60",
  encourage: "bg-rose-400/40",
};

// Emote that pops in next to Nox per mood.
const emoteByMood: Record<NoxMood, string | null> = {
  idle:      null,
  thinking:  "💭",
  happy:     "✨",
  excited:   "🎉",
  encourage: "💪",
};

// Decorative sparkles that orbit when celebrating.
function Sparkles({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 text-xs"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, Math.cos((i / 4) * Math.PI * 2) * 60],
            y: [0, Math.sin((i / 4) * Math.PI * 2) * 60],
            scale: [0.4, 1.1, 0.4],
          }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeOut" }}
        >
          ✦
        </motion.span>
      ))}
    </>
  );
}

export function Nox({
  message,
  mood = "idle",
  size = 96,
}: {
  message?: string;
  mood?: NoxMood;
  size?: number;
}) {
  const body = bodyAnim[mood];
  const wing = wingAnim[mood];
  const emote = emoteByMood[mood];
  const celebrating = mood === "happy" || mood === "excited";

  return (
    <div className="flex items-end gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {/* Glow halo */}
        <motion.span
          aria-hidden
          className={`absolute inset-0 rounded-full blur-2xl ${haloByMood[mood]}`}
          animate={{
            scale: celebrating ? [1, 1.4, 1] : [1, 1.15, 1],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: celebrating ? 0.6 : 2.6, repeat: Infinity, ease: "easeInOut" }}
        />

        <Sparkles active={celebrating} />

        {/* Body bob + rotate */}
        <motion.div
          className="absolute inset-0 origin-bottom"
          animate={{ y: body.y, rotate: body.rotate }}
          transition={{ duration: body.duration, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Wing flap (squash/stretch) */}
          <motion.img
            src={owlSrc}
            alt="Nox the owl"
            className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(124,92,255,0.45)]"
            style={{ transformOrigin: "50% 65%" }}
            animate={{ scaleX: wing.scaleX, scaleY: wing.scaleY }}
            transition={{ duration: wing.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Thinking dots above Nox when pondering */}
        <AnimatePresence>
          {mood === "thinking" && (
            <motion.div
              key="thinking-dots"
              className="absolute -right-1 -top-2 flex gap-0.5 rounded-full bg-card/90 px-1.5 py-0.5 ring-1 ring-border"
              initial={{ opacity: 0, scale: 0.6, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block h-1 w-1 rounded-full bg-accent"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pop-in mood emote */}
        <AnimatePresence>
          {emote && (
            <motion.span
              key={`emote-${mood}`}
              aria-hidden
              className="absolute -right-2 -top-2 select-none text-2xl"
              initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
              animate={{ opacity: 1, scale: [0.3, 1.25, 1], rotate: [0, -8, 6, 0] }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.55, ease: "backOut" }}
            >
              {emote}
            </motion.span>
          )}
        </AnimatePresence>
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
