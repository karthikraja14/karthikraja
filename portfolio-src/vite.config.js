import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        → normal multi-file build in dist/ (what you deploy)
// `npm run build:single` → everything inlined into one HTML file in dist-single/
//                          (handy for sharing a preview as a single file)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
}));
