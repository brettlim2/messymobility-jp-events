import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Standalone MessyNet Japan dashboards. base './' for static hosting.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5178, strictPort: true },
})
