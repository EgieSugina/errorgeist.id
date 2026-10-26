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
  build: { sourcemap: false },
});
