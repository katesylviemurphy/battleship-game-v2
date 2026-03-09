/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050810',
          900: '#0a0f1c',
          800: '#101828',
          700: '#182035',
          600: '#1f2d4a',
          500: '#2a3f65',
        },
        ocean: {
          600: '#0d4f6f',
          500: '#1a6b8f',
          400: '#2596be',
          300: '#38bdf8',
          200: '#7dd3fc',
        },
        sonar: {
          500: '#00d4aa',
          400: '#00f5c4',
          300: '#5eead4',
        },
        hit: {
          500: '#dc2626',
          400: '#f87171',
          300: '#fca5a5',
        },
        miss: {
          500: '#475569',
          400: '#60a5fa',
        },
        sunk: {
          500: '#991b1b',
          400: '#b91c1c',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    }
  },
  plugins: [],
}

