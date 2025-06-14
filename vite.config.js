import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  // Get directory of current file
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, dirname)
  
  console.log(`Building in mode: ${mode}`)
  
  // Handle deployment targets
  let base = '/'
  let outDir = 'dist'
  
  if (command !== 'serve') {
    // Production build
    if (mode === 'github') {
      base = '/Dare-to-Win/'
      outDir = 'docs'
      console.log('Building for GitHub Pages')
    } else if (mode === 'vercel') {
      base = '/'
      console.log('Building for Vercel')
    } else if (mode === 'netlify') {
      base = '/'
      console.log('Building for Netlify')
    } else if (env.VITE_BASE) {
      base = env.VITE_BASE
      console.log(`Using base from environment: ${base}`)
    }
  }
  
  return {
    plugins: [react()],
    base,
    build: {
      outDir,
      emptyOutDir: true,
      assetsDir: 'assets',
      // Ensure correct MIME types for JS modules
      rollupOptions: {
        output: {
          // Explicitly set JavaScript chunk file extensions to include correct MIME type
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    }
  }
})
