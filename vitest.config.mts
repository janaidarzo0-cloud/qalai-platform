import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
