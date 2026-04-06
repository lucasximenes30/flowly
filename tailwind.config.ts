import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff4ff',
          100: '#dbe2ff',
          200: '#becbff',
          300: '#93abff',
          400: '#637ffd',
          500: '#4258f9',
          600: '#3040eb',
          700: '#0b25d6',
          800: '#111fab',
          900: '#141e87',
          950: '#101552',
        },
        surface: {
          50: '#f8f9fb',
          100: '#f1f3f7',
          200: '#e2e5ed',
          300: '#c8ccd8',
          400: '#a8adbb',
          500: '#8f93a1',
          600: '#7a7d8b',
          700: '#666875',
          800: '#282a32',
          900: '#16171d',
          950: '#0c0d10',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        elevated: '0 10px 40px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}

export default config
