import { Shield, Zap, BrainCircuit, Wand2, MessageCircleMore, Boxes } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

const features = [
  {
    icon: Zap,
    accent: 'amber',
    title: 'Instant Static Analysis',
    description: '25+ built-in rules detect dangerous patterns in milliseconds, before AI even responds.',
  },
  {
    icon: BrainCircuit,
    accent: 'cyan',
    title: 'AI Deep Review',
    description: 'Gemini AI understands context, logic flaws, and architecture concerns regex cannot catch.',
  },
  {
    icon: Boxes,
    accent: 'purple',
    title: 'Two-Layer Intelligence',
    description: 'Static and AI results merge automatically with smart deduplication.',
  },
  {
    icon: Shield,
    accent: 'pink',
    title: 'Security Audit',
    description: 'Catches SQL injection, XSS, hardcoded secrets, insecure deserialization, and more OWASP risks.',
  },
  {
    icon: Wand2,
    accent: 'green',
    title: 'Fix Suggestions',
    description: 'Every issue includes a concrete code fix, not just a warning.',
  },
  {
    icon: MessageCircleMore,
    accent: 'cyan',
    title: 'Explain Fix AI',
    description: 'Click any issue for a plain-English explanation of why it is dangerous and how the fix works.',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan">Features</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">A review engine built for production-grade signal.</h2>
          <p className="mt-4 text-base leading-7 text-text-secondary">The interface is premium, but the substance is serious: deterministic static checks for immediate feedback and AI for deeper context.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <GlassCard key={feature.title} accent={feature.accent} className="h-full min-h-[180px]">
              <feature.icon className="h-6 w-6 text-current" />
              <h3 className="mt-5 text-lg font-semibold text-text-primary">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
