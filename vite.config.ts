import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/APP-LIBRERIA/',
  server: {
    host: true,
    port: 5173
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      selfDestroying: true,
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'BiblioDesk - Libreria Digitale',
        short_name: 'BiblioDesk',
        description: 'La tua libreria digitale personale mobile-first per gestire letture e statistiche.',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/APP-LIBRERIA/',
        start_url: '/APP-LIBRERIA/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('html5-qrcode')) return 'vendor-scanner';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
          }
        }
      }
    }
  }
})
