import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // 1. Fuentes personalizadas (conectadas a variables CSS de Next.js)
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        spacemono: ['var(--font-space-mono)', 'monospace'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
      // 2. Colores semánticos (opcional, pero útil)
      colors: {
        // Un fondo más oscuro que el slate-950 estándar para el espacio profundo
        void: '#020617',
        // Tus neones principales
        'neon-cyan': '#22d3ee', // cyan-400
        'neon-red': '#f87171', // red-400
        'neon-lime': '#a3e635', // lime-400
      },
      // 3. Animaciones para la UI (Grid y parpadeos)
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
