#!/usr/bin/env node
/**
 * Convierte el SVG de la imagen Open Graph a PNG 1200×630.
 *
 * WhatsApp / X / Facebook / LinkedIn NO renderizan SVG en og:image —
 * necesitan un raster. Este script corre antes del build para que el
 * PNG esté siempre sincronizado con el SVG fuente. Si cambiás
 * /public/og-image.svg, corré `npm run og` (o `npm run build`, que ya
 * lo invoca en predeploy).
 *
 * Uso: node scripts/generate-og.mjs
 */
import { readFile, writeFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svgPath = join(publicDir, 'og-image.svg')
const pngPath = join(publicDir, 'og-image.png')

async function main() {
  const svg = await readFile(svgPath, 'utf-8')

  // 1200×630 es el sweet-spot universal de OG (FB, WA, X, LinkedIn).
  // Density por encima de 96 produce un PNG más nítido pero pesado;
  // mantenemos default para que pese < 300KB.
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      // Si el server no tiene Montserrat instalado, resvg usa el
      // fallback sans-serif. En CI / en la mayoría de macOS es suficiente.
      fontFiles: [],
      loadSystemFonts: true,
      defaultFontFamily: 'Helvetica',
    },
  })
  const pngBuffer = resvg.render().asPng()
  await writeFile(pngPath, pngBuffer)

  const { size } = await stat(pngPath)
  const kb = (size / 1024).toFixed(1)
  console.log(`✓ og-image.png generado · ${kb} KB · 1200×630`)
  if (size > 300 * 1024) {
    console.warn(
      `⚠ Pesa ${kb} KB. WhatsApp/X funcionan bien hasta ~300 KB, ` +
        'considerá optimizar el SVG si crece más.',
    )
  }
}

main().catch((err) => {
  console.error('Falló la generación de og-image.png:', err)
  process.exit(1)
})
