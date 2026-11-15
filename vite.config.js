import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { VitePWA } from 'vite-plugin-pwa';

// Caminho do site no GitHub Pages: https://<usuario>.github.io/<repositorio>/
// Definido no build pela variável BASE_PATH (o workflow do GitHub preenche sozinho).
const base = process.env.BASE_PATH || '/';

export default defineConfig(({ mode }) => {
  if (mode === 'singlefile') {
    // Prévia em arquivo único (artifact do Claude): sem service worker.
    return { plugins: [react(), tailwindcss(), viteSingleFile()], build: { outDir: 'dist-preview' } };
  }
  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-64.png'],
        manifest: {
          name: 'Europa 26/27 — Roteiro',
          short_name: 'Europa 26/27',
          description: 'Roteiro de fim de ano: Munique, Praga, Kutná Hora, Viena e Salzburgo.',
          lang: 'pt-BR',
          start_url: '.',
          scope: '.',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#16203a',
          theme_color: '#16203a',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,woff2}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              // Mapas já vistos ficam guardados para uso sem internet (até 3.000 quadros, 45 dias).
              urlPattern: /^https:\/\/([a-d]\.)?basemaps\.cartocdn\.com\//,
              handler: 'CacheFirst',
              options: { cacheName: 'map-tiles', expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 28 } /* termos CARTO 9.c(ii): no máx. 30 dias no aparelho */, cacheableResponse: { statuses: [0, 200] } },
            },
            {
              urlPattern: /^https:\/\/routing\.openstreetmap\.de\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'routes', networkTimeoutSeconds: 6, expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 } },
            },
            {
              urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'geocode', networkTimeoutSeconds: 6, expiration: { maxEntries: 100 } },
            },
          ],
        },
      }),
    ],
    build: { outDir: 'dist' },
  };
});
