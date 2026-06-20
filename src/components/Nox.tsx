import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import owlAsset from "@/assets/lexiq-owl-transparent.png.asset.json";

const owlSrc = owlAsset.url;

export type NoxMood = "idle" | "happy" | "encourage" | "thinking" | "excited";

const haloByMood: Record<NoxMood, string> = {
  idle:      "bg-primary/25",
  thinking:  "bg-accent/30",
  happy:     "bg-emerald-400/40",
  excited:   "bg-amber-400/45",
  encourage: "bg-rose-400/30",
};

// Brief mood emotes (one-shot, not looping)
const emoteByMood: Record<NoxMood, string | null> = {
  idle:      null,
  thinking:  "💭",
  happy:     "✨",
  excited:   "🎉",
  encourage: "💪",
};

// Short celebration burst on entering happy/excited
const moodBurst: Partial<Record<NoxMood, { y: number[]; scale: number[]; duration: number }>> = {
  happy:   { y: [0, -10, 0], scale: [1, 1.06, 1], duration: 0.55 },
  excited: { y: [0, -14, -2, -8, 0], scale: [1, 1.08, 1, 1.04, 1], duration: 0.75 },
};

export function Nox({
  message,
  mood = "idle",
  size = 96,
  speaking: speakingProp,
}: {
  message?: string;
  mood?: NoxMood;
  size?: number;
  /** Force speaking on. Normally Nox auto-speaks for ~2.4s when `message` changes. */
  speaking?: boolean;
}) {
  // Speaking burst: triggers on each new message, lasts ~2.4s, then stops.
  const [speaking, setSpeaking] = useState(false);
  const lastMsg = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (speakingProp) {
      setSpeaking(true);
      return;
    }
    if (!message) {
      setSpeaking(false);
      return;
    }
    if (message === lastMsg.current) return;
    lastMsg.current = message;
    setSpeaking(true);
    const t = window.setTimeout(() => setSpeaking(false), 2400);
    return () => window.clearTimeout(t);
  }, [message, speakingProp]);

  // Occasional blink (140ms scaleY squish) — every 4–7s
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let id: number;
    const loop = () => {
      id = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 140);
        loop();
      }, 4000 + Math.random() * 3000);
    };
    loop();
    return () => window.clearTimeout(id);
  }, []);

  // Occasional gentle head tilt — every 6–11s
  const [tilt, setTilt] = useState(0);
  useEffect(() => {
    let id: number;
    const loop = () => {
      id = window.setTimeout(() => {
        setTilt(Math.random() > 0.5 ? 3 : -3);
        window.setTimeout(() => setTilt(0), 900);
        loop();
      }, 6000 + Math.random() * 5000);
    };
    loop();
    return () => window.clearTimeout(id);
  }, []);

  const emote = emoteByMood[mood];
  const burst = moodBurst[mood];

  return (
    <div className="flex items-end gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {/* Soft halo — subtle pulse only */}
        <motion.span
          aria-hidden
          className={`absolute inset-0 rounded-full blur-2xl ${haloByMood[mood]}`}
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Layer 1: head tilt + blink squish + subtle breathing */}
        <motion.div
          className="absolute inset-0 origin-bottom"
          animate={{
            rotate: tilt,
            scaleY: blink ? 0.93 : 1,
          }}
          transition={{
            rotate: { duration: 0.7, ease: "easeInOut" },
            scaleY: { duration: 0.14, ease: "easeOut" },
          }}
        >
          <motion.div
            className="h-full w-full"
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Layer 2: speaking nod (only while speaking) + mood burst (one-shot via key) */}
            <motion.div
              key={mood}
              className="h-full w-full"
              animate={burst
                ? { y: burst.y, scale: burst.scale }
                : { y: 0, scale: 1 }}
              transition={burst
                ? { duration: burst.duration, ease: "easeOut" }
                : { duration: 0.3 }}
            >
              <motion.img
                src={owlSrc}
                alt="Nox the owl"
                className="h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(124,92,255,0.45)]"
                draggable={false}
                animate={speaking
                  ? { y: [0, -1.5, 0, -1.5, 0], scaleY: [1, 0.985, 1, 0.985, 1] }
                  : { y: 0, scaleY: 1 }}
                transition={speaking
                  ? { duration: 0.42, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.25 }}
                style={{ transformOrigin: "50% 60%" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Thinking dots (subtle, only while pondering) */}
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
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* One-shot mood emote */}
        <AnimatePresence>
          {emote && (
            <motion.span
              key={`emote-${mood}`}
              aria-hidden
              className="absolute -right-2 -top-2 select-none text-2xl"
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.35, ease: "backOut" }}
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
            initial={{ opacity: 0, x: -8, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
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
