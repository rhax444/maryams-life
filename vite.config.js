import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, host: true },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Three.js has no React dependency, so it can safely live in its own cached chunk.
        // React and everything that uses it stay together to keep load order correct.
        manualChunks: (id) => (/node_modules[\/]three[\/]/.test(id) ? 'three' : undefined),
      },
    },
  },
})
