import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Tooltip({ label, children, className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex ${className}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      <AnimatePresence>
        {open ? (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute -top-11 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-elevated px-3 py-1 text-xs text-text-secondary shadow-xl"
            role="tooltip"
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
