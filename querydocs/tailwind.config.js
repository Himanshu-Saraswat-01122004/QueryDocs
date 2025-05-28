/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'bounce-gentle': 'bounce 2s infinite ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        'slate-750': '#1e293b', // Between 700 and 800
        'slate-850': '#0f1629', // Between 800 and 900
      },
    },
  },
  plugins: [],
}
