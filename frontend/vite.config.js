import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    compression(),          
    visualizer({ open: true }) 
  ],
  optimizeDeps: {
    exclude: ['@editorjs/editorjs']
  },
  build: {
    cssCodeSplit: true,     
    minify: 'esbuild',       
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const parts = id.toString().split('node_modules/')[1].split('/')
            return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
          }
        }
      }
    }
  }
})
