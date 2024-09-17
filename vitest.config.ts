import path from 'path';
import { defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react';

let provide: any;
export default defineConfig({
  plugins: [react()],
  test: {
    provide: {
      DATABASE_URL: '',
    },
    coverage: {
      provider: 'v8',
      exclude: [
        './src/components/**/*',
        './.next',
        './src/middleware.ts',
        './src/app/**/*',
        './src/providers/**/*',
        './src/api/index.ts',
        './vitest.config.ts',
        './next.config.mjs',
        './next-env.d.ts',
        './postcss.config.mjs',
        './tailwind.config.ts',
        './src/lib/utils.ts',
      ],
    },
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.all.ts'],
    globalSetup: ['./src/tests/setup.once.ts'],
    reporters: ['default'],
  },
  server: {
    proxy: {
      '/': 'http://localhost:3000/',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
