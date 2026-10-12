import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Handshake, Frown, Home, RefreshCw } from 'lucide-react';

export type Outcome = 'win' | 'loss' | 'draw';

export function GameOverModal({
  open,
  outcome,
  title,
  detail,
  onRematch,
  onHome,
}: {
  open: boolean;
  outcome: Outcome;
  title: string;
  detail?: string;
  onRematch: () => void;
  onHome: () => void;
}) {
  const Icon = outcome === 'win' ? Trophy : outcome === 'draw' ? Handshake : Frown;
  const tone =
    outcome === 'win'
      ? 'from-amber-300/30 to-accent-blue/20'
      : outcome === 'draw'
        ? 'from-accent-cyan/20 to-accent-violet/20'
        : 'from-slate-400/20 to-slate-600/10';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass glass-strong w-full max-w-sm rounded-[28px] p-6 text-center"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${tone}`}
            >
              <Icon size={30} className="text-1" />
            </div>
            <h2 className="text-xl font-bold text-1">{title}</h2>
            {detail && <p className="mt-1 text-sm text-2">{detail}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onHome}
                className="glass glass-hover flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-2"
              >
                <Home size={17} /> Home
              </button>
              <button
                onClick={onRematch}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet py-3 text-sm font-semibold text-white shadow-glow"
              >
                <RefreshCw size={17} /> Rematch
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
