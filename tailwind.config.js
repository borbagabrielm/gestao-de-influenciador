/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: '#0e0e10', 2: '#16161a', 3: '#1e1e24', 4: '#26262e' },
        accent:  { DEFAULT: '#c8f043', 2: '#a8d028', dark: '#1a2200' },
        border:  { DEFAULT: 'rgba(255,255,255,0.08)', 2: 'rgba(255,255,255,0.14)' },
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        title: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}