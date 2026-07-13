import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
