/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        border: 'var(--border)',
        glow: 'var(--border-glow)',
        purple: 'var(--accent-purple)',
        violet: 'var(--accent-violet)',
        cyan: 'var(--accent-cyan)',
        pink: 'var(--accent-pink)',
        amber: 'var(--accent-amber)',
        green: 'var(--accent-green)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'count-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 0 1px rgba(139,92,246,0.2), 0 0 30px rgba(139,92,246,0.24)',
        'glow-cyan': '0 0 0 1px rgba(6,182,212,0.2), 0 0 30px rgba(6,182,212,0.24)',
        'glow-pink': '0 0 0 1px rgba(236,72,153,0.2), 0 0 30px rgba(236,72,153,0.24)',
        'glow-amber': '0 0 0 1px rgba(245,158,11,0.2), 0 0 30px rgba(245,158,11,0.24)',
        'glow-green': '0 0 0 1px rgba(16,185,129,0.2), 0 0 30px rgba(16,185,129,0.24)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'scan-line': 'scan-line 2.8s linear infinite',
        'slide-in-up': 'slide-in-up 0.45s ease forwards',
        'fade-in': 'fade-in 0.25s ease forwards',
        'count-up': 'count-up 0.35s ease forwards',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
