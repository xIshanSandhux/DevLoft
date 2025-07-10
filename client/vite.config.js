import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    process: {},
    global: 'window'
  },
  optimizeDeps: {
    include: ['buffer', 'process']
  }
})
