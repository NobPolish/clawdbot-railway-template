import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--chimera-bg)',
        foreground: 'var(--chimera-text)',
        surface: 'var(--chimera-surface)',
        'surface-elevated': 'var(--chimera-surface-elevated)',
        border: 'var(--chimera-border)',
        'border-glow': 'var(--chimera-border-glow)',
        muted: 'var(--chimera-text-muted)',
        dim: 'var(--chimera-text-dim)',
        accent: 'var(--chimera-accent)',
        'accent-hover': 'var(--chimera-accent-hover)',
        cyan: 'var(--chimera-cyan)',
        purple: 'var(--chimera-purple)',
        success: 'var(--chimera-success)',
        warning: 'var(--chimera-warning)',
        danger: 'var(--chimera-danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        chimera: 'var(--chimera-radius)',
        'chimera-sm': 'var(--chimera-radius-sm)',
        'chimera-lg': 'var(--chimera-radius-lg)',
      },
      transitionTimingFunction: {
        spring: 'var(--chimera-spring)',
        chimera: 'var(--chimera-ease)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s var(--chimera-ease) forwards',
        'fade-in': 'fadeIn 0.4s var(--chimera-ease) forwards',
        'scale-in': 'scaleIn 0.3s var(--chimera-spring) forwards',
        'slide-down': 'slideDown 0.3s var(--chimera-ease) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        breathe: 'breathe 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
