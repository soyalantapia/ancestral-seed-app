#!/usr/bin/env node
/**
 * Fix V4-PUB-05 (auditoría v4): verifica en CI que los assets
 * críticos referenciados desde el código existen en disco. Si un
 * asset falta (PDF renombrado, og-image borrado por error, etc.),
 * el build falla con mensaje claro en vez de deployar 404s.
 *
 * Assets que verifica:
 *   - Lista fija: PDF del Reglamento, OG image, favicons/logo, PWA
 *     icons, robots.txt/sitemap.xml.
 *   - Dinámico: TODAS las rutas locales (/cards, /gallery, /authors,
 *     /docs) referenciadas en cualquier .ts/.tsx bajo src/ — cubre
 *     coverUrl/avatarUrl/galleryUrls/contact.catalogUrl de data.ts
 *     Y los fallbacks hardcodeados en componentes (COVER_FALLBACK,
 *     AVATAR_FALLBACK, etc.) sin tener que listarlos a mano.
 *     Auditoría (2026-07-02): la lista fija no cubría esas ~50+
 *     referencias; un rename/delete futuro de una card o foto de
 *     galería pasaba CI sin que nada lo detectara.
 *
 * Se invoca antes del build vía `prebuild`. Si falla, el build NO
 * arranca y el deploy queda bloqueado hasta arreglarlo.
 */
import { existsSync, statSync, readFileSync, readdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC = join(ROOT, 'public')
const SRC = join(ROOT, 'src')

function listSourceFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listSourceFiles(full))
    else if (['.ts', '.tsx'].includes(extname(entry.name))) out.push(full)
  }
  return out
}

/**
 * Extrae de todo src/ cualquier ruta local dentro de /cards, /gallery,
 * /authors o /docs (las 4 carpetas de assets del sitio). NO ancla al
 * inicio del string entre comillas: muchas referencias van con
 * `${import.meta.env.BASE_URL}cards/x.webp` (BASE_URL interpolado
 * antes), así que buscamos la subcadena en cualquier posición.
 * Ignora URLs http(s) externas (ej. avatares de pravatar.cc de mocks
 * placeholder) porque esas nunca matchean el patrón de carpeta local.
 */
function extractLocalAssetRefs() {
  const found = new Set()
  const re =
    /(?:cards|gallery|authors|docs)\/[a-zA-Z0-9_./-]+\.(?:webp|jpe?g|png|svg|pdf)/g
  for (const filePath of listSourceFiles(SRC)) {
    const src = readFileSync(filePath, 'utf-8')
    for (const m of src.matchAll(re)) {
      // Descartar coincidencias que son parte de una URL externa http(s):
      // p.ej. "https://faolex.fao.org/docs/pdf/gua122086.pdf" contiene la
      // subcadena "docs/pdf/gua122086.pdf" pero NO es un asset local (viven
      // links legales oficiales en src/data/legislacion.ts). Aislamos el
      // token desde la comilla que abre el string hasta el match; si ese
      // prefijo tiene "://", es una URL y no un path local → se ignora.
      const idx = m.index ?? 0
      const boundary = Math.max(
        src.lastIndexOf("'", idx),
        src.lastIndexOf('"', idx),
        src.lastIndexOf('`', idx),
      )
      const prefix = src.slice(boundary + 1, idx)
      if (prefix.includes('://')) continue
      found.add(m[0])
    }
  }
  return [...found]
}

const DYNAMIC_ASSETS = extractLocalAssetRefs()

const REQUIRED_ASSETS = [
  // Reglamento PDF — usado en Footer, Help (cláusulas), CertRequest
  'docs/reglamento-marca-ancestral-seed.pdf',
  // Catálogos de autores — botón "Descargar catálogo" en la ficha pública
  'docs/catalogo-ecodestinos-2025.pdf',
  'docs/catalogo-alunawa-2022.pdf',
  // OG image — preview en WhatsApp/X/LinkedIn
  'og-image.png',
  'og-image.svg',
  // Brand
  'favicon.svg',
  'favicon.ico',
  'favicon-32.png',
  'apple-touch-icon.png',
  'logo-mark.png',
  // PWA
  'pwa-192.png',
  'pwa-512.png',
  // SEO
  'robots.txt',
  'sitemap.xml',
]

const ALL_ASSETS = [...new Set([...REQUIRED_ASSETS, ...DYNAMIC_ASSETS])]

const missing = []
const warnings = []

for (const rel of ALL_ASSETS) {
  const full = join(PUBLIC, rel)
  if (!existsSync(full)) {
    missing.push(rel)
    continue
  }
  const size = statSync(full).size
  if (size === 0) {
    warnings.push(`${rel} existe pero está vacío (${size} bytes)`)
  }
}

if (missing.length > 0) {
  console.error('❌ Assets FALTANTES en public/:')
  for (const m of missing) console.error(`   - ${m}`)
  console.error('')
  console.error('El build no puede continuar — restaurá o regenerá los assets.')
  process.exit(1)
}

if (warnings.length > 0) {
  for (const w of warnings) console.warn(`⚠️  ${w}`)
}

console.log(
  `✓ Assets verificados · ${REQUIRED_ASSETS.length} fijos + ${DYNAMIC_ASSETS.length} de data.ts OK`,
)
