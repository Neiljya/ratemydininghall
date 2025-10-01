import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/pages/components'),
      '@styles': path.resolve(__dirname, './src/pages/styles'),
      '@globalStyles': path.resolve(__dirname, './src/global-styles'),
      '@containerStyles': path.resolve(__dirname, 'src/global-styles/container-styles'),
      '@layoutStyles': path.resolve(__dirname, 'src/global-styles/layout-styles'),
      '@textStyles': path.resolve(__dirname, 'src/global-styles/text-styles'),
      '@textComponents': path.resolve(__dirname, './src/pages/components/text-components'),
      '@stars': path.resolve(__dirname, './src/pages/components/stars'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@redux': path.resolve(__dirname, './src/redux'),
      '@state': path.resolve(__dirname, './src/redux/store.tsx'),
    },
  },
})
