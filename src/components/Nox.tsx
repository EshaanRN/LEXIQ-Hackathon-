import { motion, AnimatePresence } from "framer-motion";
import owlAsset from "@/assets/lexiq-owl-transparent.png.asset.json";

const owlSrc = owlAsset.url;

export type NoxMood = "idle" | "happy" | "encourage" | "thinking" | "excited";

// Subtle body sway — never jumpy.
const bodyAnim: Record<NoxMood, { y: number[]; rotate: number[]; duration: number }> = {
  idle:      { y: [0, -2, 0],   rotate: [-1, 1, -1],   duration: 4.5 },
  thinking:  { y: [0, -1, 0],   rotate: [-3, 2, -3],   duration: 3.2 },
  happy:     { y: [0, -6, 0],   rotate: [-3, 3, -3],   duration: 0.9 },
  excited:   { y: [0, -8, -2, -6, 0], rotate: [-4, 4, -3, 4, 0], duration: 0.8 },
  encourage: { y: [0, -2, 0],   rotate: [-1, 2, -1],   duration: 2.4 },
};

// Wing-flap rhythm per mood. Strong horizontal squash so the silhouette reads as flapping.
const flapDuration: Record<NoxMood, number> = {
  idle: 1.6,
  thinking: 1.8,
  happy: 0.45,
  excited: 0.32,
  encourage: 1.3,
};
const flapAmp: Record<NoxMood, number> = {
  idle: 0.06,
  thinking: 0.05,
  happy: 0.22,
  excited: 0.3,
  encourage: 0.1,
};

const haloByMood: Record<NoxMood, string> = {
  idle:      "bg-primary/30",
  thinking:  "bg-accent/40",
  happy:     "bg-emerald-400/50",
  excited:   "bg-amber-400/60",
  encourage: "bg-rose-400/40",
};

const emoteByMood: Record<NoxMood, string | null> = {
  idle:      null,
  thinking:  "💭",
  happy:     "✨",
  excited:   "🎉",
  encourage: "💪",
};

function Sparkles({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 text-xs text-amber-300"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, Math.cos((i / 5) * Math.PI * 2) * 70],
            y: [0, Math.sin((i / 5) * Math.PI * 2) * 70],
            scale: [0.4, 1.2, 0.4],
          }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.13, ease: "easeOut" }}
        >
          ✦
        </motion.span>
      ))}
    </>
  );
}

/**
 * Animated beak overlay — opens/closes while `speaking` is true.
 * Positioned over the owl's beak area. Tweak top/left % if the artwork shifts.
 */
function Beak({ speaking, size }: { speaking: boolean; size: number }) {
  const w = size * 0.13;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute rounded-[40%] bg-[#1a0f0a]"
      style={{
        width: w,
        left: `calc(50% - ${w / 2}px)`,
        top: "57%",
        transformOrigin: "50% 0%",
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.08)",
      }}
      animate={
        speaking
          ? { height: [w * 0.18, w * 0.55, w * 0.22, w * 0.5, w * 0.2], opacity: 0.85 }
          : { height: w * 0.18, opacity: 0.7 }
      }
      transition={speaking ? { duration: 0.42, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    />
  );
}

export function Nox({
  message,
  mood = "idle",
  size = 96,
  speaking = false,
}: {
  message?: string;
  mood?: NoxMood;
  size?: number;
  /** When true, the beak opens/closes to simulate talking. Auto-on whenever a message is showing. */
  speaking?: boolean;
}) {
  const body = bodyAnim[mood];
  const emote = emoteByMood[mood];
  const celebrating = mood === "happy" || mood === "excited";
  const isSpeaking = speaking || Boolean(message);
  const amp = flapAmp[mood];

  return (
    <div className="flex items-end gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <motion.span
          aria-hidden
          className={`absolute inset-0 rounded-full blur-2xl ${haloByMood[mood]}`}
          animate={{
            scale: celebrating ? [1, 1.4, 1] : [1, 1.12, 1],
            opacity: [0.5, 0.85, 0.5],
          }}
          transition={{ duration: celebrating ? 0.6 : 2.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <Sparkles active={celebrating} />

        {/* Gentle body sway */}
        <motion.div
          className="absolute inset-0 origin-bottom"
          animate={{ y: body.y, rotate: body.rotate }}
          transition={{ duration: body.duration, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Wing flap = horizontal squash with quick down-stroke */}
          <motion.div
            className="h-full w-full"
            style={{ transformOrigin: "50% 60%" }}
            animate={{
              scaleX: [1, 1 + amp, 1 - amp * 0.6, 1 + amp * 0.7, 1],
              scaleY: [1, 1 - amp * 0.5, 1 + amp * 0.3, 1 - amp * 0.3, 1],
            }}
            transition={{ duration: flapDuration[mood], repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative h-full w-full">
              <img
                src={owlSrc}
                alt="Nox the owl"
                className="h-full w-full object-contain drop-shadow-[0_10px_28px_rgba(124,92,255,0.5)]"
                draggable={false}
              />
              <Beak speaking={isSpeaking} size={size} />
            </div>
          </motion.div>
        </motion.div>

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
