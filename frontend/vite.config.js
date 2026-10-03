import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: Object.fromEntries(
      ['/api', '/sanctum', '/storage', '/share'].map((path) => [
        path,
        { target: 'http://127.0.0.1:8000', changeOrigin: true },
      ]),
    ),
  },
})
