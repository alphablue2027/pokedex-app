import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/pokedex-app/',
  plugins: [react()],
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      include: ['src/**'],
      exclude: ['src/tests/**', 'src/main.jsx']
    }
  }
})
