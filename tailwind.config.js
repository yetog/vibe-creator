/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A24A',
          dim:     '#8a6e2f',
          glow:    '#e8c06a',
        },
        cyan: {
          hud:     '#4dd9ff',
          dim:     '#2a8fa8',
        },
        slam: {
          bg:       '#020202',
          surface:  '#151515',
          surface2: '#1e1e1e',
          border:   '#262626',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        inter:  ['Inter', 'system-ui', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'border-sweep': 'borderSweep 6s linear infinite',
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        borderSweep: {
          '0%, 100%': { borderColor: '#C9A24A' },
          '50%':      { borderColor: '#4dd9ff' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.85)' },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(201, 162, 74, 0.4)',
        'cyan-glow': '0 0 20px rgba(77, 217, 255, 0.4)',
        'tv-inner':  'inset 0 0 40px rgba(0,0,0,0.8), inset 0 0 80px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
