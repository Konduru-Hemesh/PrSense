import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AnimatedHeadline({ prefix = '', words = [], suffix = '', className = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [words.length]);

  const currentWord = words[index] || '';

  return (
    <h1 className={className}>
      <span>{prefix}</span>{' '}
      <span className="relative inline-block min-w-[280px] align-baseline text-gradient">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, filter: 'blur(8px)' }}
            transition={{ duration: 0.35 }}
            className="absolute left-0 top-0 whitespace-nowrap"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
        <span className="invisible">{currentWord}</span>
      </span>{' '}
      <span>{suffix}</span>
    </h1>
  );
}
