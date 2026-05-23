import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('monaco-editor') || id.includes('@monaco-editor')) {
              return 'monaco';
            }
            if (id.includes('@react-three/fiber')) {
              return 'r3f';
            }
            if (id.includes('@react-three/drei')) {
              return 'drei';
            }
            if (id.includes('/three/') || id.includes('three/build') || id.includes('three/src')) {
              return 'three-core';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});
