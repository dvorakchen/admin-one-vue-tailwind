import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/admin-view',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': './src'
    }
  }
})
