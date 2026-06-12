import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
     react(),
     tailwindcss(),
     [viteCompression()],
     compression({
      algorithm: 'brotliCompress', // or 'gzip'
      ext: '.br',                  // or '.gz'
      deleteOriginFile: false
    }),
    visualizer({
      filename: './dist/bundle-analysis.html',
      open: true, // Open browser after build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: 'es2018', // Avoid legacy JS
    minify: 'terser', // Better minification than 'esbuild'
    sourcemap: false, // Disable sourcemaps for smaller build
    rollupOptions: {
      output: {
        manualChunks: {
          // Optional: Split vendor libraries
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
