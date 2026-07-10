/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: {
            deep: '#0d0e10',
            panel: '#16181c',
          },
          gold: {
            light: '#e8dcc8',
            dark: '#d4c4a0',
          },
          text: {
            primary: '#f5f5f0',
            secondary: '#9a9a9a',
          },
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #e8dcc8, #d4c4a0)',
        'dark-overlay': 'linear-gradient(to bottom, rgba(13, 14, 16, 0.4), rgba(13, 14, 16, 0.95))',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
