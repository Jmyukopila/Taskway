import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      includeAssets: ['favicon.svg', 'offline.html'],
      manifest: {
        name: 'Taskway',
        short_name: 'Taskway',
        description: 'Organizador personal — horario de clases y checklist diario',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['productivity', 'lifestyle'],
        prefer_related_applications: false,
        launch_handler: { client_mode: 'focus-existing' },
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/\/api\//]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
})
