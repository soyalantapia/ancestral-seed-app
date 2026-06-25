import { create } from 'qrcode'

/**
 * URL pública canónica del sitio (mismo criterio que PageMeta). En el
 * build de dominio resuelve a https://ancestralseed.com; en la demo de
 * GitHub Pages, a la URL del subpath. Es la que se codifica en el QR
 * físico que va a la etiqueta, así que tiene que ser absoluta y estable.
 */
const QR_SITE_URL = 'https://ancestralseed.com'

/**
 * URL de la ficha pública de un certificado — el destino del QR.
 *
 * Apunta SIEMPRE al dominio canónico de producción, sin importar desde
 * dónde se descargue: el QR va impreso en una etiqueta física permanente
 * y la demo de GitHub Pages es solo un espejo. Además, una URL corta =
 * menos datos = QR con menos módulos (líneas) = más fácil de escanear.
 */
export function certPublicUrl(slug: string): string {
  return `${QR_SITE_URL}/certificado/${slug}`
}

export type QrStyle = 'simple' | 'marca'

export interface QrSizeOption {
  key: string
  label: string
  px: number
  hint: string
}

/** Tres tamaños listos para imprimir en una etiqueta física. */
export const QR_SIZES: QrSizeOption[] = [
  { key: 'chico', label: 'Chico', px: 256, hint: '~2 cm · etiqueta' },
  { key: 'mediano', label: 'Mediano', px: 512, hint: '~5 cm · colgante' },
  { key: 'grande', label: 'Grande', px: 1024, hint: '~10 cm · póster' },
]

/** Logo de marca para el centro del QR "con marca" (servido desde /public). */
const LOGO_SRC = `${import.meta.env.BASE_URL}logo-mark.png`

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`))
    img.src = src
  })
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Colores por estilo. El de marca usa navy (alto contraste = escaneable). */
const QR_COLORS: Record<QrStyle, { dark: string; light: string }> = {
  simple: { dark: '#000000', light: '#ffffff' },
  marca: { dark: '#001c38', light: '#ffffff' },
}

/** Los tres "ojos" (finder patterns) ocupan 7×7 módulos en las esquinas. */
function isFinderModule(row: number, col: number, count: number): boolean {
  const top = row < 7
  const bottom = row >= count - 7
  const left = col < 7
  const right = col >= count - 7
  return (top && left) || (top && right) || (bottom && left)
}

/**
 * Dibuja un "ojo" redondeado (anillo + punto central) en coords de píxel.
 * Sólo se redondean las esquinas: las líneas que cruzan el centro mantienen
 * la proporción 1:1:3:1:1 que el lector usa para detectarlo.
 */
function drawFinderEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
  color: string,
): void {
  const s = cell * 7
  ctx.fillStyle = color
  roundedRectPath(ctx, x, y, s, s, cell * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  roundedRectPath(ctx, x + cell, y + cell, cell * 5, cell * 5, cell * 1.4)
  ctx.fill()
  ctx.fillStyle = color
  roundedRectPath(ctx, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell * 0.9)
  ctx.fill()
}

/**
 * Renderiza el QR desde su matriz de bits con módulos de esquinas
 * redondeadas y ojos estilados → menos ruido visual y más identidad de
 * marca, sin tocar los datos. La variante "marca" usa navy + logo al
 * centro (EC 'Q' tolera taparlo). Si el logo no carga, degrada a un QR
 * válido sin marca. Reusa el canvas que le pasés (preview) o crea uno.
 */
export async function renderQrCanvas(opts: {
  text: string
  size: number
  style: QrStyle
  canvas?: HTMLCanvasElement
}): Promise<HTMLCanvasElement> {
  const { text, size, style } = opts
  const canvas = opts.canvas ?? document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const withLogo = style === 'marca'
  const { dark, light } = QR_COLORS[style]

  // 'L' en la pelada (menos módulos = más prolijo); 'H' (30% de tolerancia)
  // en la de marca para que el logo central NO rompa el escaneo. Verificado
  // por decodificación: con 'Q' no decodificaba, con 'H' sí.
  const qr = create(text, { errorCorrectionLevel: withLogo ? 'H' : 'L' })
  const count = qr.modules.size
  const margin = 4
  const cell = size / (count + margin * 2)
  const off = margin * cell

  ctx.fillStyle = light
  ctx.fillRect(0, 0, size, size)

  // Módulos de datos con esquinas redondeadas.
  ctx.fillStyle = dark
  const radius = cell * 0.36
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.modules.get(row, col)) continue
      if (isFinderModule(row, col, count)) continue // los ojos van aparte
      roundedRectPath(ctx, off + col * cell, off + row * cell, cell, cell, radius)
      ctx.fill()
    }
  }

  // Ojos redondeados en las tres esquinas.
  drawFinderEye(ctx, off, off, cell, dark)
  drawFinderEye(ctx, off + (count - 7) * cell, off, cell, dark)
  drawFinderEye(ctx, off, off + (count - 7) * cell, cell, dark)

  // Logo de marca al centro (con caja blanca + borde de marca).
  if (withLogo) {
    try {
      const logo = await loadImage(LOGO_SRC)
      const box = Math.round(size * 0.24)
      const pos = Math.round((size - box) / 2)
      const pad = Math.round(box * 0.14)
      const r = Math.round(box * 0.24)
      // Caja blanca que despeja los módulos bajo el logo (EC 'H' los
      // recupera). Sin borde: un trazo encima corrompía módulos vecinos.
      ctx.fillStyle = '#ffffff'
      roundedRectPath(ctx, pos - pad, pos - pad, box + pad * 2, box + pad * 2, r)
      ctx.fill()
      ctx.drawImage(logo, pos, pos, box, box)
    } catch {
      // Logo opcional: si falla, el QR ya quedó dibujado y es válido.
    }
  }

  return canvas
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('No se pudo generar la imagen'))
    }, 'image/png')
  })
}

/** Genera el PNG del QR listo para descargar. */
export async function buildQrPngBlob(opts: {
  text: string
  size: number
  style: QrStyle
}): Promise<Blob> {
  const canvas = await renderQrCanvas(opts)
  return canvasToPngBlob(canvas)
}

/** Dispara la descarga de un blob con el nombre dado. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Pequeño delay para que el click procese antes de revocar el object URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
