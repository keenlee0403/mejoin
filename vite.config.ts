import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 关键修改：使用相对路径，确保在任何托管环境下都能找到资源
  plugins: [react()],
  server: {
    host: true, 
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})