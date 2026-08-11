import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Bind mounts do Docker no Windows não propagam eventos inotify;
    // sem polling o hot-reload não dispara.
    watch: { usePolling: true, interval: 300 },
  },
})
