import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/pokedex-app/',
  plugins: [react()],
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: './src/tests/vitest.setup.ts',
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      include: ['src/**'],
      exclude: ['src/tests/**', 'src/main.tsx', 'src/vite-env.d.ts'],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 90,
        lines: 95
      }
    }
  }
})
