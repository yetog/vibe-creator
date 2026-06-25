/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mood-based colors
        chill: {
          primary: '#60A5FA',    // Blue
          secondary: '#818CF8',  // Indigo
          accent: '#A78BFA',     // Violet
        },
        energetic: {
          primary: '#F97316',    // Orange
          secondary: '#EF4444',  // Red
          accent: '#FBBF24',     // Amber
        },
        dark: {
          primary: '#6366F1',    // Indigo
          secondary: '#8B5CF6',  // Violet
          accent: '#A855F7',     // Purple
        },
        uplifting: {
          primary: '#10B981',    // Emerald
          secondary: '#34D399',  // Green
          accent: '#FBBF24',     // Yellow
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
