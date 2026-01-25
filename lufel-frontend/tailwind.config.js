/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ceramic: {
          50: '#faf6f1',
          100: '#f5ede0',
          200: '#ebdbc1',
          300: '#e1c9a2',
          400: '#d7b783',
          500: '#cda564',
          600: '#a48450',
          700: '#7b633c',
          800: '#524228',
          900: '#292114',
        },
      },
    },
  },
  plugins: [],
}

