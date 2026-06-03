import { AnimatePresence, motion } from "framer-motion";

export interface ToastData {
  id: number;
  xp: number;
  mastered: boolean;
}

export function XPToast({ toasts }: { toasts: ToastData[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -80 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="rounded-full bg-primary px-6 py-3 font-display text-2xl font-bold text-primary-foreground glow-primary">
              +{t.xp} XP
            </div>
            {t.mastered && (
              <div className="mt-2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-accent-foreground">
                Word Mastered!
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
