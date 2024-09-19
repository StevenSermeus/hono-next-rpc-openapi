// import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
        './src/tests/setup.all.ts',
        './src/tests/setup.next.ts',
        './src/tests/setup.once.ts',
      ],
    },
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.all.ts'],
    globalSetup: ['./src/tests/setup.once.ts'],
  },
  server: {
    proxy: {
      '/': 'http://localhost:3000/',
    },
  },
});
