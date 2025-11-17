import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: [
      { find: '@/lib', replacement: path.resolve(__dirname, 'lib') },
      { find: '@/components', replacement: path.resolve(__dirname, 'components') },
      { find: '@/app', replacement: path.resolve(__dirname, 'app') },
      { find: '@', replacement: __dirname },
    ],
  },
})
