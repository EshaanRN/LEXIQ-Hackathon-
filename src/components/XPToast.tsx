import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { subscribeToasts } from "@/lib/game-store";
import { Coins, Zap } from "lucide-react";

interface Toast {
  id: number;
  xp?: number;
  coins?: number;
  label: string;
}

export function XPToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = subscribeToasts((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 1800);
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.6, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-display text-sm font-bold text-primary-foreground glow-primary"
          >
            {t.xp != null && (
              <span className="flex items-center gap-1">
                <Zap className="h-4 w-4" /> +{t.xp} XP
              </span>
            )}
            {t.coins != null && (
              <span className="flex items-center gap-1 text-gold">
                <Coins className="h-4 w-4" /> +{t.coins}
              </span>
            )}
            <span className="opacity-90">· {t.label}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
