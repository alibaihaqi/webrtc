import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': resolve(__dirname),
      '@': resolve(__dirname),
      '#app': resolve(__dirname, 'composables/__mocks__/app.ts'),
    },
  },
  esbuild: {
    tsconfigRaw: '{}',
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'composables/__tests__/**/*.test.ts',
      'components/__tests__/**/*.test.ts',
      'tests/unit/**/*.test.ts',
      'tests/e2e/**/*.test.ts',
    ],
  },
})
