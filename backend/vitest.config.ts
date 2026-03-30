import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'file:./prisma/test.db',
    },
    globalSetup: './tests/global-setup.ts',
  },
});
