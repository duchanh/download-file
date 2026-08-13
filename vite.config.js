import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => ({
  plugins: command === 'serve' ? [basicSsl()] : [],
  css: {
    // Keep this standalone app isolated from the parent Astro project's
    // PostCSS/Tailwind configuration.
    postcss: { plugins: [] }
  },
  server: {
    host: '0.0.0.0',
    https: true
  }
}))
