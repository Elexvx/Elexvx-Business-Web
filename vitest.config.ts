import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-dev/**',
      '**/esa/**',
      '**/.git/**',
      '**/.claude/**',
      '**/.worktrees/**',
      '**/worktrees/**',
    ],
  },
});
