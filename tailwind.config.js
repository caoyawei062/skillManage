/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Classic Dark
        'classic': {
          bg: '#0D0D0D',
          card: '#181818',
          border: '#2A2A2A',
          primary: '#6366F1',
          text: '#FAFAFA',
          muted: '#A1A1AA',
          accent: '#22C55E',
        },
        // Midnight Blue
        'midnight': {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          primary: '#3B82F6',
          text: '#F8FAFC',
          muted: '#94A3B8',
          accent: '#F59E0B',
        },
        // Forest Dark
        'forest': {
          bg: '#0A0F0A',
          card: '#1A2E1A',
          border: '#2D4A2D',
          primary: '#10B981',
          text: '#ECFDF5',
          muted: '#6EE7B7',
          accent: '#FCD34D',
        },
        // Violet Dark
        'violet': {
          bg: '#0D0B1E',
          card: '#1A1630',
          border: '#2E2650',
          primary: '#A855F7',
          text: '#FAF5FF',
          muted: '#D8B4FE',
          accent: '#F472B6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
