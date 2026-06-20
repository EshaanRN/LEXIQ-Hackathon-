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

const emoteByMood: Record<NoxMood, string | null> = {
  idle:      null,
  thinking:  "💭",
  happy:     "✨",
  excited:   "🎉",
  encourage: "💪",
};

const moodBurst: Partial<Record<NoxMood, { y: number[]; scale: number[]; duration: number }>> = {
  happy:   { y: [0, -8, 0], scale: [1, 1.04, 1], duration: 0.55 },
  excited: { y: [0, -10, -2, -6, 0], scale: [1, 1.05, 1, 1.03, 1], duration: 0.75 },
};

export function Nox({
  message,
  mood = "idle",
  size = 96,
  speaking: speakingProp,
  intro = false,
}: {
  message?: string;
  mood?: NoxMood;
  size?: number;
  speaking?: boolean;
  intro?: boolean;
}) {
  // Speaking burst
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

  // Intro phase: glide in with wing flaps, then settle
  const [introPhase, setIntroPhase] = useState(intro ? "entering" : "settled");
  useEffect(() => {
    if (!intro) {
      setIntroPhase("settled");
      return;
    }
    setIntroPhase("entering");
    const t = window.setTimeout(() => setIntroPhase("settled"), 2600);
    return () => window.clearTimeout(t);
  }, [intro]);

  // Occasional blink (120ms)
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let id: number;
    const loop = () => {
      id = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 120);
        loop();
      }, 3500 + Math.random() * 4000);
    };
    loop();
    return () => window.clearTimeout(id);
  }, []);

  // Occasional gentle head tilt — every 7–12s
  const [tilt, setTilt] = useState(0);
  useEffect(() => {
    let id: number;
    const loop = () => {
      id = window.setTimeout(() => {
        setTilt(Math.random() > 0.5 ? 2.5 : -2.5);
        window.setTimeout(() => setTilt(0), 800);
        loop();
      }, 7000 + Math.random() * 5000);
    };
    loop();
    return () => window.clearTimeout(id);
  }, []);

  const emote = emoteByMood[mood];
  const burst = moodBurst[mood];
  const isEntering = introPhase === "entering";

  // Entrance with wing flap:
  // - Gentle glide from left
  // - Slow buoyant wing beats: body rises slightly, tilts, stretches subtly
  const entranceVariants = {
    hidden:  { x: -220, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Slow, smooth wing flap cycle on the image itself
  // 2 flaps total during entrance (~2.4s), then settle
  const wingFlapAnim = {
    y:        [0, -5, 0, -4, 0, -3, 0],
    rotate:   [0, 1.2, 0, -0.8, 0, 0.6, 0],
    scaleY:   [1, 1.018, 1, 1.014, 1, 1.01, 1],
    transition: { duration: 2.4, ease: "easeInOut" },
  };

  // Calm idle: very subtle breathing + current tilt/blink
  const idleAnim = {
    y: 0,
    rotate: tilt,
    scaleY: blink ? 0.94 : 1,
    transition: {
      y: { duration: 0.3 },
      rotate: { duration: 0.7, ease: "easeInOut" },
      scaleY: { duration: 0.12, ease: "easeOut" },
    },
  };

  // Speaking nod: gentle vertical pulse (beak motion simulation)
  const speakAnim = {
    y: [0, -1.8, 0, -1.5, 0],
    scaleY: [1, 0.988, 1, 0.988, 1],
    transition: { duration: 0.45, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <div className="flex items-end gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {/* Soft ambient halo */}
        <motion.span
          aria-hidden
          className={`absolute inset-0 rounded-full blur-2xl ${haloByMood[mood]}`}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main container: entrance glide on outer wrapper */}
        <motion.div
          className="absolute inset-0"
          variants={entranceVariants}
          initial={isEntering ? "hidden" : false}
          animate="visible"
        >
          {/* Breathing layer */}
          <motion.div
            className="h-full w-full"
            animate={{ scale: [1, 1.012, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Mood burst + wing flap / idle / speaking */}
            <motion.div
              key={mood}
              className="h-full w-full"
              animate={burst
                ? { y: burst.y, scale: burst.scale }
                : isEntering
                  ? wingFlapAnim
                  : speaking
                    ? speakAnim
                    : idleAnim}
              transition={burst
                ? { duration: burst.duration, ease: "easeOut" }
                : undefined}
              style={{ transformOrigin: "50% 65%" }}
            >
              {/* Drop shadow that subtly pulses during wing beats */}
              <motion.img
                src={owlSrc}
                alt="Nox the owl"
                className="h-full w-full object-contain"
                draggable={false}
                animate={isEntering
                  ? { filter: [
                      "drop-shadow(0 10px 24px rgba(124,92,255,0.35)",
                      "drop-shadow(0 14px 32px rgba(124,92,255,0.45)",
                      "drop-shadow(0 10px 24px rgba(124,92,255,0.35)",
                      "drop-shadow(0 13px 28px rgba(124,92,255,0.42)",
                      "drop-shadow(0 10px 24px rgba(124,92,255,0.35)",
                      "drop-shadow(0 12px 26px rgba(124,92,255,0.40)",
                      "drop-shadow(0 10px 24px rgba(124,92,255,0.35))",
                    ] }
                  : { filter: "drop-shadow(0 10px 24px rgba(124,92,255,0.35))" }}
                transition={isEntering ? { duration: 2.4, ease: "easeInOut" } : { duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Thinking dots */}
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
