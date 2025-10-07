import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      // list every tsconfig that should contribute paths
      projects: ['./tsconfig.app.json']
    })
  ],
  resolve: {
    alias: {
      '@globalStyles': path.resolve(__dirname, 'src/global-styles'),
    }
  }
})
