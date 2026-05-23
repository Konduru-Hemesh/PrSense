import { motion } from 'framer-motion';
import { ArrowRight, Bot, Code2, Layers3, Sparkles } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

const steps = [
  {
    icon: Code2,
    title: 'Paste or upload code',
    description: 'Drop in a file or paste a snippet from your editor. PRSense accepts multiple languages and file types.',
  },
  {
    icon: Sparkles,
    title: 'Static engine fires instantly',
    description: 'Known dangerous patterns are flagged in the browser immediately so the UI never feels blocked.',
  },
  {
    icon: Bot,
    title: 'Gemini analyzes in parallel',
    description: 'The backend performs semantic reasoning at the same time, hunting for logic bugs and architectural risks.',
  },
  {
    icon: Layers3,
    title: 'Merged results land together',
    description: 'Duplicates are collapsed, confidence improves, and the review is ready to act on.',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber">How it Works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">From raw code to senior-level feedback in one pass.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-text-secondary">PRSense was designed to feel instant without sacrificing depth. The static engine handles the obvious risks; Gemini handles the nuanced ones.</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <GlassCard className="h-full min-h-[220px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{step.description}</p>
                {index < steps.length - 1 ? <ArrowRight className="mt-6 h-4 w-4 text-text-muted" /> : null}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
