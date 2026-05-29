import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate avoids the stale-service-worker footgun: a re-deploy
      // refreshes the installed app without a manual prompt.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'brierly — calibration tracker',
        short_name: 'brierly',
        description:
          'Log probabilistic predictions, resolve them, and see whether your confidence matches reality.',
        display: 'standalone',
        start_url: '/',
        theme_color: '#1f2937',
        background_color: '#1f2937',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
