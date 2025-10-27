import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Bookmarks Analysis',
        short_name: 'Bookmarks',
        description: 'Local-first bookmarks merge and analysis',
        theme_color: '#0ea5e9',
        background_color: '#0b1220',
        display: 'standalone'
      },
      devOptions: { enabled: true }
    })
  ]
})
