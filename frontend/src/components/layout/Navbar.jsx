import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../utils/formatters';
import GlowButton from '../shared/GlowButton';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#workflow' },
  { label: 'Architecture', href: '#architecture' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed left-0 top-0 z-40 w-full transition-all duration-300',
        scrolled ? 'border-b border-white/5 bg-base/70 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="PRSense home">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-purple/90 via-violet/80 to-cyan/80 shadow-glow-purple">
            <span className="text-sm font-black tracking-widest text-white">PR</span>
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-text-primary">PRSense</p>
            <p className="text-xs text-text-secondary">AI that reviews code like your best senior engineer.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="text-sm text-text-secondary transition hover:text-text-primary">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <GlowButton as={Link} to="/dashboard" variant="secondary" className="hidden sm:inline-flex">
            Start Analyzing <ArrowRight className="h-4 w-4" />
          </GlowButton>
          <GlowButton as={Link} to="/dashboard" variant="primary" className="sm:hidden px-4 py-2.5">
            <Sparkles className="h-4 w-4" />
            Analyze
          </GlowButton>
        </div>
      </div>
    </header>
  );
}
