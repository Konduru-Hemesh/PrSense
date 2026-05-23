import { forwardRef } from 'react';
import { cn } from '../../utils/formatters';

const GlowButton = forwardRef(function GlowButton(
  { className = '', variant = 'primary', as: Component = 'button', children, ...props },
  ref,
) {
  const styles = {
    primary: 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-[0_0_28px_rgba(139,92,246,0.34)] hover:shadow-[0_0_42px_rgba(139,92,246,0.52)] hover:-translate-y-0.5 hover:scale-[1.015]',
    secondary: 'border border-white/10 bg-white/[0.04] text-text-primary hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-0.5',
    subtle: 'border border-white/10 bg-transparent text-text-secondary hover:text-text-primary hover:border-white/20 hover:bg-white/[0.04]',
  };

  return (
    <Component
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-cyan/70 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export default GlowButton;
