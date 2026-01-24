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
        graphite: {
          base: '#0A0A0A',
          surface: '#121212',
          secondary: '#1A1A1A',
          border: '#2A2A2A',
          input: '#1F1F1F',
          text: {
            main: '#E5E5E5',
            sub: '#A3A3A3',
            muted: '#737373',
          },
        },
      },
    },
  },
  plugins: [],
}