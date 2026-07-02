#!/usr/bin/env node
/**
 * Fix V4-PUB-05 (auditoría v4): verifica en CI que los assets
 * críticos referenciados desde el código existen en disco. Si un
 * asset falta (PDF renombrado, og-image borrado por error, etc.),
 * el build falla con mensaje claro en vez de deployar 404s.
 *
 * Assets que verifica:
 *   - PDF del Reglamento (referenciado desde Footer + Help + CertReq)
 *   - OG image (referenciada desde index.html + PageMeta default)
 *   - Logo y favicons (referenciados desde index.html + manifest)
 *   - PWA icons (referenciados desde manifest)
 *   - robots.txt y sitemap.xml (SEO)
 *
 * Se invoca antes del build vía `prebuild`. Si falla, el build NO
 * arranca y el deploy queda bloqueado hasta arreglarlo.
 */
import { existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

const REQUIRED_ASSETS = [
  // Reglamento PDF — usado en Footer, Help (cláusulas), CertRequest
  'docs/reglamento-marca-ancestral-seed.pdf',
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

const missing = []
const warnings = []

for (const rel of REQUIRED_ASSETS) {
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
  console.error('❌ Assets críticos FALTANTES en public/:')
  for (const m of missing) console.error(`   - ${m}`)
  console.error('')
  console.error('El build no puede continuar — restaurá o regenerá los assets.')
  process.exit(1)
}

if (warnings.length > 0) {
  for (const w of warnings) console.warn(`⚠️  ${w}`)
}

console.log(`✓ Assets verificados · ${REQUIRED_ASSETS.length} archivos OK`)
