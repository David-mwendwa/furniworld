import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned so the backend's CORS allowlist has a stable origin to match, and
    // kept clear of 5000 which macOS AirPlay Receiver holds.
    port: 5006,
    strictPort: true,
  },
});
