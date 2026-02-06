import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/types/**',
          '.next/',
        ],
        thresholds: {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
        },
      },
    },
  })
)
