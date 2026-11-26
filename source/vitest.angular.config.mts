import { defineConfig } from 'vitest/config';

/**
 * The Angular unit tests, from their bundles (see tsup.angular.spec.config.ts).
 */
export default defineConfig({
  test: {
    include: ['.angular-spec-bundles/**/*.spec.angular.mjs'],
    environment: 'jsdom',
    setupFiles: ['./build/vitest-angular-setup.mjs'],
  },
});
