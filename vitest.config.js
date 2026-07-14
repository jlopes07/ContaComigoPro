import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true, // permite usar 'describe', 'it', 'expect' globalmente sem importar explicitamente se desejado
  },
});
