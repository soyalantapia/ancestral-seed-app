import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

/**
 * Base path del deploy. Default = GitHub Pages (subdirectorio).
 * Para el dominio propio (ancestralseed.com, docroot raíz) se buildea
 * con `npm run build:domain`, que setea DEPLOY_BASE=/ y
 * VITE_SITE_URL=https://ancestralseed.com.
 */
const BASE = process.env.DEPLOY_BASE ?? '/ancestral-seed-app/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    /**
     * PWA + MSW coexistencia.
     *
     * Bug crítico (mayo 2026): VitePWA con `registerType: 'autoUpdate'`
     * inyectaba un `<script>` que en window.load registraba `sw.js`
     * al MISMO scope que el SW de MSW (/ancestral-seed-app/). El
     * segundo registro REEMPLAZA al primero, así que Workbox terminaba
     * pisando a MSW → todas las requests a /api/* iban al network →
     * 404 + HTML del SPA fallback → "Algo salió mal cargando los
     * certificados / No encontramos lo que estás buscando".
     *
     * Solución: `injectRegister: null` desactiva la inyección automática
     * del script de registro. El manifest sigue commiteado (la app es
     * instalable como PWA si MSW está OFF), pero ningún SW de Workbox
     * se registra automáticamente. MSW es el único SW activo mientras
     * VITE_USE_MSW != 'false'.
     *
     * Cuando exista backend real (`npm run build:no-msw`), se puede
     * cambiar a `injectRegister: 'auto'` y Workbox toma el control sin
     * conflicto.
     */
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // ← NO auto-register; MSW maneja el SW
      /**
       * `selfDestroying: true` — el sw.js generado se auto-desregistra al
       * activarse. Esto es CRÍTICO para usuarios que ya tenían el SW de
       * Workbox instalado antes del fix: el browser hace `update()` del
       * SW periódicamente, descarga este sw.js auto-destructivo, lo
       * activa, y se mata. La próxima vez que carguen la app, MSW puede
       * registrarse sin conflicto.
       *
       * Si en el futuro arranca el backend real (`build:no-msw`), conviene
       * pasar esto a `false` y reactivar `injectRegister: 'auto'`.
       */
      selfDestroying: true,
      includeAssets: ['favicon.svg', 'logo-mark.png', 'pwa-192.png', 'pwa-512.png'],
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
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
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
