/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#38bdf8',
        secondary: '#1e293b',
        background: '#0f172a',
        surface: '#1e293b',
        danger: '#ef4444',
        success: '#10b981',
      }
    },
  },
  plugins: [],
}
