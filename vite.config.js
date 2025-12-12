// vite.config.js

import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    // COMENTAMOS ESTA LÍNEA QUE CAUSA EL ERROR
    // environment: 'jsdom', 

    include: ['src/test/**/*.{test,spec}.{js,mjs}'],
    exclude: [...configDefaults.exclude],
  },
});