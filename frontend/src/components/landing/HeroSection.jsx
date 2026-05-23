import { ArrowRight, Github, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedHeadline from '../shared/AnimatedHeadline';
import GlassCard from '../shared/GlassCard';
import GlowButton from '../shared/GlowButton';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center px-4 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-4 top-16 -z-10 mx-auto h-[34rem] max-w-6xl rounded-[3rem] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_42%),radial-gradient(circle_at_70%_18%,rgba(6,182,212,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.05),transparent_26%)] blur-3xl" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.18fr_0.82fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-cyan" />
            Static Analysis + AI Intelligence
          </div>

          <AnimatedHeadline
            prefix="Review Code"
            words={['Instantly', 'Intelligently', 'Automatically', 'Like a Senior Engineer']}
            className="mt-6 text-5xl font-black leading-[0.92] tracking-tight text-text-primary sm:text-6xl lg:text-7xl"
          />

          <p className="mt-3 max-w-2xl text-lg font-semibold tracking-tight text-text-primary sm:text-xl lg:text-[1.5rem]">
            Built for <span className="text-gradient">Senior Engineer</span> level review velocity.
          </p>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
            PRSense combines a built-in static rule engine with Gemini AI for instant detection and deep reasoning - two layers of intelligence, one seamless experience.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <GlowButton as={Link} to="/dashboard" variant="primary" className="px-6 py-3.5 text-base">
              Analyze Code Now <ArrowRight className="h-4 w-4" />
            </GlowButton>
            <GlowButton as="a" href="#architecture" variant="secondary" className="px-6 py-3.5 text-base">
              See Architecture
            </GlowButton>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-text-secondary">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
              <div className="flex -space-x-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple to-violet" />
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan to-blue-400" />
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink to-rose-400" />
              </div>
              2,400+ developers
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
              <Star className="h-4 w-4 fill-amber text-amber" />
              <Star className="h-4 w-4 fill-amber text-amber" />
              <Star className="h-4 w-4 fill-amber text-amber" />
              <Star className="h-4 w-4 fill-amber text-amber" />
              <Star className="h-4 w-4 fill-amber text-amber" />
              4.9/5.0
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
              <Github className="h-4 w-4 text-text-secondary" />
              Built for GitHub workflows
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -3 }}
          className="relative"
        >
          <div className="absolute -inset-10 rounded-full bg-purple/15 blur-3xl" />
          <GlassCard className="relative overflow-hidden p-5 shadow-[0_0_40px_rgba(139,92,246,0.12)]" style={{ background: 'rgba(13,13,20,0.88)', borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="mb-4 flex items-center justify-between text-xs text-text-secondary">
              <span>Preview: merged review</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-cyan">
                <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_12px_rgba(6,182,212,0.75)] animate-pulse" />
                Live review engine
              </span>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan via-purple to-pink shadow-[0_0_20px_rgba(6,182,212,0.35)]" />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-amber/20 bg-amber/10 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full border border-amber/30 bg-amber/10 px-2.5 py-1 text-[11px] font-semibold text-amber">⚡ Static Engine</span>
                  <span className="text-xs text-text-muted">Line 8</span>
                </div>
                <p className="text-sm font-semibold text-text-primary">XSS risk via innerHTML assignment</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">Assigning to innerHTML parses user-controlled content as HTML and can execute attacker-supplied payloads.</p>
              </div>
              <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-[11px] font-semibold text-cyan">🤖 AI Analysis</span>
                  <span className="text-xs text-text-muted">Line 14</span>
                </div>
                <p className="text-sm font-semibold text-text-primary">State update may race with async callback</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">The component updates shared state after an awaited request without guarding against unmounts, which can cause stale UI or memory leaks.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
