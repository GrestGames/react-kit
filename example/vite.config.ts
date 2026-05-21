import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Resolve the symlinked kit to its real source (preserveSymlinks would keep it
  // under node_modules, which the dev watcher ignores → no HMR on kit edits).
  // dedupe keeps a single copy of the shared singletons across kit + example.
  resolve: {
    dedupe: ['react', 'react-dom', '@grest-ts/schema', '@grest-ts/schema-file', 'react-datepicker'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    fs: { allow: ['..'] },
  },
});
