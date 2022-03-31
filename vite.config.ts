/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: false, // process.chdir() is not supported in workers
    globals: true,
    watch: false,
    includeSource: ['src/**/*.ts'],
  },
})
