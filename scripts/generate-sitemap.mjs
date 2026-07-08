#!/usr/bin/env node
/**
 * Fix V4-PUB-02 (auditoría v4): el sitemap.xml estático listaba solo
 * las 6 rutas estáticas (home, directorio, verificar, ayuda, legal,
 * nosotros). Las fichas `/certificado/:slug` y los perfiles
 * `/autor/:slug` — que son JUSTAMENTE el contenido único y diferencial
 * que indexa Google — no estaban. Long-tail SEO perdido.
 *
 * Este script lee los mocks y genera un sitemap.xml dinámico con TODAS
 * las URLs públicas, incluyendo cada cert + cada autor. Se invoca
 * desde `npm run sitemap` y se encadena en `prebuild`.
 *
 * Cuando entre backend, este script lee del API en lugar de los mocks.
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITEMAP_PATH = join(ROOT, 'public', 'sitemap.xml')
// Configurable por env para el build del dominio propio
// (build:domain → https://ancestralseed.com). Default: GitHub Pages.
const BASE_URL =
  process.env.VITE_SITE_URL ??
  'https://soyalantapia.github.io/ancestral-seed-app'
const DATA_TS = join(ROOT, 'src', 'services', 'mocks', 'data.ts')

// Parseo barato: extraemos los slugs con regex en lugar de importar
// el .ts directamente (que requeriría ts-node). El formato del mock
// es lo suficientemente estable como para que un grep sea fiable.
const source = readFileSync(DATA_TS, 'utf8')
const slugRegex = /slug:\s*'([a-z0-9-]+)'/g
const slugs = new Set()
let match
while ((match = slugRegex.exec(source)) !== null) {
  slugs.add(match[1])
}

// Heurística: autores están en el bloque `mockAuthors`, certs en
// `mockCertifications`. Separamos los dos buckets buscando el bloque
// que contiene cada slug. Cada bloque termina cuando aparece el
// siguiente `export const` (arrays anidados rompen detección por `]`).
const findNextExport = (from) => {
  const idx = source.indexOf('\nexport const ', from + 1)
  return idx === -1 ? source.length : idx
}
const authorsBlockStart = source.indexOf('export const mockAuthors')
const authorsBlockEnd = findNextExport(authorsBlockStart)
const certsBlockStart = source.indexOf('export const mockCertifications')
const certsBlockEnd = findNextExport(certsBlockStart)
const authorsBlock = source.slice(authorsBlockStart, authorsBlockEnd)
const certsBlock = source.slice(certsBlockStart, certsBlockEnd)

const authorSlugs = []
const certSlugs = []
for (const slug of slugs) {
  if (authorsBlock.includes(`'${slug}'`)) {
    authorSlugs.push(slug)
  } else if (certsBlock.includes(`'${slug}'`)) {
    certSlugs.push(slug)
  }
  // Si está en otro bloque (futuro) lo ignoramos.
}

const today = new Date().toISOString().slice(0, 10)

const urlEntry = (loc, opts = {}) => {
  const { changefreq = 'monthly', priority = 0.5, lastmod = today } = opts
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

const staticEntries = [
  urlEntry(`${BASE_URL}/`, { changefreq: 'weekly', priority: 1.0 }),
  urlEntry(`${BASE_URL}/directorio`, { changefreq: 'weekly', priority: 0.9 }),
  urlEntry(`${BASE_URL}/verificar`, { changefreq: 'monthly', priority: 0.8 }),
  urlEntry(`${BASE_URL}/nosotros`, { changefreq: 'monthly', priority: 0.7 }),
  urlEntry(`${BASE_URL}/ayuda`, { changefreq: 'monthly', priority: 0.6 }),
  urlEntry(`${BASE_URL}/legal`, { changefreq: 'monthly', priority: 0.5 }),
  // Apartado "Legislación" — página pública indexable (marco legal por país).
  urlEntry(`${BASE_URL}/legal/legislacion`, { changefreq: 'monthly', priority: 0.6 }),
]

const certEntries = certSlugs
  .sort()
  .map((slug) =>
    urlEntry(`${BASE_URL}/certificado/${slug}`, {
      changefreq: 'monthly',
      priority: 0.85,
    }),
  )

const authorEntries = authorSlugs
  .sort()
  .map((slug) =>
    urlEntry(`${BASE_URL}/autor/${slug}`, {
      changefreq: 'monthly',
      priority: 0.75,
    }),
  )

const allEntries = [...staticEntries, ...certEntries, ...authorEntries]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Generado automáticamente por scripts/generate-sitemap.mjs.
  NO editar a mano — los cambios se sobreescriben en cada build.
  Fix V4-PUB-02 (auditoría v4): incluye fichas dinámicas (autores +
  certs) además de las rutas estáticas.

  Total URLs: ${allEntries.length} (${staticEntries.length} estáticas + ${certEntries.length} certs + ${authorEntries.length} autores)
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.join('\n')}
</urlset>
`

writeFileSync(SITEMAP_PATH, sitemap, 'utf8')
console.log(
  `✓ sitemap.xml generado · ${allEntries.length} URLs (${staticEntries.length} static + ${certEntries.length} certs + ${authorEntries.length} autores)`,
)
