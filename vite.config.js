import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1B3C53',   // Deep Blue (Sidebar/Headers)
          medium: '#234C6A', // Buttons/Active States
          light: '#456882',  // Accents/Borders
          bg: '#E3E3E3',     // Global Background
          white: '#FFFFFF'
        }
      }
    },
  }
})