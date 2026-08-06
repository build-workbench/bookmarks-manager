/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || (mode === 'production' ? '/bookmarks-manager/' : '/')
  const isProd = mode === 'production'

  return {
    base,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Bookmarks Manager',
          short_name: 'Bookmarks',
          description: 'Local-first bookmark cleanup, search, backup, and export',
          theme_color: '#0ea5e9',
          background_color: '#0b1220',
          display: 'standalone',
          start_url: './#/app/upload',
          scope: './',
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ],
          categories: ['productivity', 'utilities'],
          shortcuts: [
            {
              name: 'Open workspace',
              short_name: 'Workspace',
              description: 'Jump into the bookmark workspace',
              url: './#/app/upload',
              icons: [{ src: 'favicon.svg', sizes: 'any' }]
            },
            {
              name: 'Search bookmarks',
              short_name: 'Search',
              description: 'Search imported bookmarks',
              url: './#/app/search',
              icons: [{ src: 'favicon.svg', sizes: 'any' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,ico}'],
          globIgnores: ['**/*.map'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true
        }
      })
    ],
    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: !isProd,
      chunkSizeWarningLimit: 700
    },
    server: {
      host: true,
      port: 5173
    },
    preview: {
      host: true,
      port: 4173
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules/', 'dist/', '.git/'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*'],
        thresholds: {
          lines: 35,
          functions: 50,
          branches: 40,
          statements: 35
        }
      },
      testTimeout: 10000
    }
  }
})
