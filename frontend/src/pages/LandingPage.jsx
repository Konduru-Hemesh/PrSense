import { Component, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import FeatureCards from '../components/landing/FeatureCards';
import WorkflowSection from '../components/landing/WorkflowSection';
import CTASection from '../components/landing/CTASection';
import FloatingOrbs from '../components/three/FloatingOrbs';
import ParticleField from '../components/three/ParticleField';
import GlassCard from '../components/shared/GlassCard';

class CanvasBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 bg-gradient-radial from-purple/20 via-base to-base" />;
    }

    return this.props.children;
  }
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple">Architecture</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">Two Engines. One Pipeline.</h2>
          <p className="mt-4 text-base leading-7 text-text-secondary">Static analysis catches dangerous patterns instantly while Gemini performs semantic reasoning in parallel. The merged result gives you both speed and depth without forcing a tradeoff.</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-center">
          <GlassCard accent="purple" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Your Code</p>
            <p className="mt-4 text-lg font-semibold text-text-primary">Editor input or uploaded file</p>
          </GlassCard>
          <div className="flex flex-col items-center justify-center gap-3 text-text-muted lg:flex-row lg:gap-0">
            <span className="hidden h-px w-14 border-t border-dashed border-cyan/40 lg:block" />
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">Parallel</span>
            <span className="hidden h-px w-14 border-t border-dashed border-cyan/40 lg:block" />
          </div>
          <GlassCard accent="cyan" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Gemini AI</p>
            <p className="mt-4 text-lg font-semibold text-text-primary">Deeper semantic analysis</p>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <GlassCard accent="amber" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Static Engine</p>
            <p className="mt-4 text-sm leading-7 text-text-secondary">Regex and heuristics produce instant findings in the browser.</p>
          </GlassCard>
          <GlassCard accent="cyan" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">AI Analysis</p>
            <p className="mt-4 text-sm leading-7 text-text-secondary">Gemini captures subtle bugs, architecture concerns, and contextual fixes.</p>
          </GlassCard>
          <GlassCard accent="purple" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Merge Layer</p>
            <p className="mt-4 text-sm leading-7 text-text-secondary">Duplicate findings collapse into one clearer signal.</p>
          </GlassCard>
          <GlassCard accent="green" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Merged Results</p>
            <p className="mt-4 text-sm leading-7 text-text-secondary">The final review is fast, contextual, and actionable.</p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-base">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 z-0">
        <CanvasBoundary>
          <Canvas alpha gl={{ antialias: true }} camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 1.5]} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', opacity: 0.38 }}>
            <Suspense fallback={null}>
              <FloatingOrbs />
              <ParticleField />
            </Suspense>
            <ambientLight intensity={0.2} />
          </Canvas>
        </CanvasBoundary>
        <div className="absolute left-[-10%] top-[-8%] h-56 w-56 rounded-full bg-purple/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-8%] right-[-8%] h-64 w-64 rounded-full bg-cyan/8 blur-[160px] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute left-1/2 top-[42%] h-48 w-48 -translate-x-1/2 rounded-full bg-pink/8 blur-[150px] animate-float" style={{ animationDelay: '0.9s' }} />
      </div>
      <main className="relative z-10">
        <HeroSection />
        <FeatureCards />
        <ArchitectureSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
