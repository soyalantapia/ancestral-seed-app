import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const BASE = '/ancestral-seed-app/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    /**
     * PWA: solo en producción para no chocar con el service worker de MSW
     * que se registra en dev. En prod ambos coexisten: MSW intercepta /api/*
     * (registrado primero en bootstrap) y Workbox cachea el resto.
     */
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo-mark.png'],
      manifest: {
        name: 'Ancestral Seed · Certificación digital',
        short_name: 'Ancestral Seed',
        description:
          'Validamos la autenticidad de productos, servicios y saberes ancestrales, mediante un sistema de certificación cultural, auditoría y tecnología blockchain.',
        theme_color: '#001c38',
        background_color: '#f7f5ee',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: BASE,
        scope: BASE,
        lang: 'es-AR',
        icons: [
          { src: 'logo-mark.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          // Nota: logo-large fue migrado a .webp pero los iconos PWA deben ser
          // PNG/JPEG para máxima compatibilidad. Reutilizamos logo-mark a 512.
          { src: 'logo-mark.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['business', 'productivity', 'lifestyle'],
      },
      workbox: {
        // MSW se queda con /api/* — Workbox no debe interceptar esas requests
        navigateFallbackDenylist: [/^\/api/, /\/api\//, /^.*\/api\//],
        // No precachear el SW de MSW ni archivos de mock
        globIgnores: ['**/mockServiceWorker.js'],
        // Páginas SPA: fallback al index.html
        navigateFallback: `${BASE}index.html`,
        // Auto-update: el SW nuevo toma control sin esperar cierre de pestañas.
        // Crítico para evitar bundle stale tras deploy → pantalla blanca por
        // chunks viejos que ya no existen en /assets/.
        skipWaiting: true,
        clientsClaim: true,
        // Limpia caches viejos en cada activación (evita persistir chunks de
        // builds anteriores)
        cleanupOutdatedCaches: true,
        // Cache de imágenes con stale-while-revalidate
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      // Dev: dejar PWA OFF para no romper MSW que usa el mismo registro
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5175,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
