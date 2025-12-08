import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        spacemono: ['var(--font-space-mono)', 'monospace'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
      colors: {
        void: '#020617',
        'neon-cyan': '#22d3ee',
        'neon-red': '#f87171',
        'neon-lime': '#a3e635',
      },
      animation: {
        'grid-scroll': 'grid-scroll 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'grid-scroll': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
    },
  },
  plugins: [],
}
export default config
