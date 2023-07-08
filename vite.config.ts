/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    threads: false, // process.chdir() is not supported in workers
    globals: true,
    watch: false,
    includeSource: ['src/**/*.{js,ts}'],
    // include: ['test/specs/*.ts'],
    include: ['test/specs/version.*.ts'],
  },
})
