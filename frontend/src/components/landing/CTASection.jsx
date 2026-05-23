import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../shared/GlassCard';
import GlowButton from '../shared/GlowButton';

export default function CTASection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <GlassCard className="relative overflow-hidden p-8 sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-purple/10 via-transparent to-cyan/10" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan">Start Now</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">Ship code with stronger confidence and faster review cycles.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">Run PRSense on your own codebase, surface obvious risks immediately, and let Gemini add the deeper context your team needs to make better decisions.</p>
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              <GlowButton as={Link} to="/dashboard" variant="primary" className="w-full justify-center sm:w-auto">
                Start Analyzing <ArrowRight className="h-4 w-4" />
              </GlowButton>
              <div className="inline-flex items-center gap-2 rounded-full border border-green/25 bg-green/10 px-4 py-2 text-sm text-green">
                <ShieldCheck className="h-4 w-4" />
                No credit card required for the demo
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
