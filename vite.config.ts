import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/nebbyneighbor/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['wills-macbook-pro-6.local']
  },
  build: {
    target: 'es2020'
  }
})