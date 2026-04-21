/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#050505',
        text:    '#F0EBE0',
        accent:  '#C6FF00',
        text2:   'rgba(240,235,224,0.45)',
        text3:   'rgba(240,235,224,0.18)',
        border:  'rgba(240,235,224,0.07)',
        border2: 'rgba(240,235,224,0.14)',
      },
      fontFamily: {
        sans: ['var(--font-space)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        scrollLine: {
          '0%':   { transform: 'scaleY(0)', opacity: '1' },
          '55%':  { transform: 'scaleY(1)', opacity: '1' },
          '100%': { transform: 'scaleY(1)', opacity: '0' },
        },
      },
      animation: {
        scrollLine: 'scrollLine 1.9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
