import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
      // Fail the build on unsupported shorthands (e.g. `border`) instead of silently dropping them.
      propertyValidationMode: 'throw',
      unstable_moduleResolution: { type: 'commonJS', rootDir: process.cwd() },
    }),
    react(),
  ],
  build: {
    sourcemap: false,
    rolldownOptions: {
      output: {
        // three.js gets its own named chunk; only the lazily loaded WebGL renderers import it.
        codeSplitting: { groups: [{ name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/ }] },
      },
    },
    // The three chunk is ~520 kB minified (~130 kB gzip) and never on the initial load.
    chunkSizeWarningLimit: 600,
  },
});
