/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'
  const isProd = mode === 'production'

  return {
    base,
    
    // =================================================================
    // RESOLVE CONFIGURATION
    // =================================================================
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@ai': resolve(__dirname, 'src/ai'),
        '@components': resolve(__dirname, 'src/ui'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@store': resolve(__dirname, 'src/store'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@workers': resolve(__dirname, 'src/workers')
      },
      dedupe: ['react', 'react-dom', 'react-router-dom']
    },

    // =================================================================
    // PLUGINS
    // =================================================================
    plugins: [
      // React SWC for lightning-fast HMR
      react(),

      // PWA with aggressive optimizations
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        strategies: 'generateSW',
        
        manifest: {
          name: 'Bookmarks Manager',
          short_name: 'Bookmarks',
          description: 'Local-first PWA for merging, deduplicating and analyzing browser bookmarks',
          theme_color: '#0ea5e9',
          background_color: '#0b1220',
          display: 'standalone',
          orientation: 'portrait',
          
          icons: [
            { 
              src: 'favicon.svg', 
              sizes: 'any', 
              type: 'image/svg+xml', 
              purpose: 'any maskable' 
            },
            { 
              src: 'pwa-192x192.png', 
              sizes: '192x192', 
              type: 'image/png',
              purpose: 'any maskable'
            },
            { 
              src: 'pwa-512x512.png', 
              sizes: '512x512', 
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],

          categories: ['productivity', 'utilities'],
          lang: 'en',
          dir: 'ltr',
          
          shortcuts: [
            {
              name: 'Upload Bookmarks',
              short_name: 'Upload',
              description: 'Import bookmarks from files',
              url: '/#/upload',
              icons: [{ src: 'favicon.svg', sizes: 'any' }]
            },
            {
              name: 'Search Bookmarks',
              short_name: 'Search',
              description: 'Search your bookmarks',
              url: '/#/search',
              icons: [{ src: 'favicon.svg', sizes: 'any' }]
            }
          ]
        },

        workbox: {
          globPatterns: [
            '**/*.{js,css,html,svg,png,woff2,json,ico}'
          ],
          globIgnores: ['**/node_modules/**/*', '**/*.map'],
          
          // Precache settings
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          
          // Runtime caching strategies
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            {
              urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
              handler: 'NetworkOnly',
              options: {
                cacheName: 'openai-api'
              }
            },
            {
              urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
              handler: 'NetworkOnly',
              options: {
                cacheName: 'anthropic-api'
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ],

          // Skip waiting for immediate activation
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,

          // Disable sourcemaps in production
          sourcemap: false
        },

        devOptions: {
          enabled: false,
          type: 'module',
          navigateFallback: 'index.html'
        }
      }),

      // Brotli compression for smaller files
      ...(isProd ? [compression({ algorithm: 'brotliCompress' })] : []),
      
      // Gzip fallback compression
      ...(isProd ? [compression({ algorithm: 'gzip' })] : []),

      // Bundle analyzer (only in analyze mode)
      ...(env.ANALYZE === 'true' ? [visualizer({ 
        open: true,
        gzipSize: true,
        brotliSize: true 
      })] : [])
    ],

    // =================================================================
    // BUILD CONFIGURATION
    // =================================================================
    build: {
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      
      // Optimize chunks
      reportCompressedSize: true,
      cssCodeSplit: true,
      sourcemap: !isProd,
      minify: isProd ? 'terser' : false,
      
      // Terser options for aggressive minification
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      } : undefined,

      // Rollup optimization
      rollupOptions: {
        treeshake: isProd,
        
        output: {
          // Optimize chunk naming
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            if (ext === 'css') {
              return `assets/styles/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },

          // Manual chunk splitting for optimal caching
          manualChunks: {
            // Core React framework
            'vendor-react': [
              'react',
              'react-dom',
              'react-router-dom'
            ],
            
            // UI and state management
            'vendor-ui': [
              'zustand',
              'lucide-react'
            ],
            
            // Data layer
            'vendor-data': [
              'dexie',
              'minisearch'
            ],
            
            // Charts and visualization
            'vendor-charts': [
              'echarts'
            ],

            // AI integrations (loaded on demand)
            'vendor-ai': [
              'cytoscape'
            ]
          }
        }
      },

      // Chunk size warnings
      chunkSizeWarningLimit: 500,

      // CSS optimization
      cssMinify: true
    },

    // =================================================================
    // DEVELOPMENT SERVER
    // =================================================================
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      open: false,
      
      // HMR configuration
      hmr: {
        overlay: true
      },

      // Proxy configuration (if needed)
      proxy: {}
    },

    // =================================================================
    // PREVIEW SERVER
    // =================================================================
    preview: {
      port: 4173,
      strictPort: true,
      host: true
    },

    // =================================================================
    // OPTIMIZATION
    // =================================================================
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'dexie',
        'minisearch',
        '@vitejs/plugin-react'
      ],
      
      exclude: [
        // Large dependencies that should be lazy loaded
      ],

      esbuildOptions: {
        target: 'es2022'
      }
    },

    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      target: 'es2022',
      legalComments: 'none'
    },

    // =================================================================
    // TESTING CONFIGURATION
    // =================================================================
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules/', 'dist/', '.git/'],
      
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/types/**'
        ],
        thresholds: {
          lines: 35,
          functions: 50,
          branches: 40,
          statements: 35
        }
      },

      // Test timeout
      testTimeout: 10000,
      
      // Enable concurrent test execution
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false
        }
      }
    },

    // =================================================================
    // EXPERIMENTAL FEATURES
    // =================================================================
    experimental: {
      // Enable CSS import assertions
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { relative: true }
        }
        return { relative: true }
      }
    },

    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  }
})
