import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    exclude: ['node_modules', 'e2e', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'e2e',
        '.next',
        'src/generated',
        '**/*.config.*',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
      },
    },
  },
});
