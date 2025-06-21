import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    compression()
  ],
  optimizeDeps: {
    exclude: ['@editorjs/editorjs']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const parts = id.toString().split('node_modules/')[1].split('/')
            // Group by package name
            return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
          }
        }
      }
    },
    chunkSizeWarningLimit: 800, // Optional: customize warning threshold
  }
})
