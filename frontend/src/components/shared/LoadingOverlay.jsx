import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingOverlay({ open, title, subtitle }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-base/80 backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ y: 12, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            className="glass-card flex max-w-md flex-col items-center gap-4 px-8 py-7 text-center"
          >
            <div className="rounded-full border border-cyan/30 bg-cyan/10 p-3 text-cyan">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              {subtitle ? <p className="mt-2 text-sm text-text-secondary">{subtitle}</p> : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
