import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'grapesjsCloudAssets',
      fileName: (format) =>
        format === 'umd' ? 'grapesjs-cloud-assets.umd.cjs' : 'grapesjs-cloud-assets.js',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // GrapesJS itself is never bundled: the plugin runs against
      // whatever grapesjs instance the host page already loaded.
      external: ['grapesjs'],
      output: {
        exports: 'named',
        globals: {
          grapesjs: 'grapesjs',
        },
      },
    },
    sourcemap: true,
  },
});
