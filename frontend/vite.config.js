import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), ['REACT_APP_', 'VITE_']);
  return {
    plugins: [react()],
    envPrefix: ['REACT_APP_', 'VITE_'],
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'build',
    },
  };
});
