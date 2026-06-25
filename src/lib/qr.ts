import { toCanvas } from 'qrcode'

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

/**
 * Dibuja el QR en un canvas (reusa el que le pasés para el preview, o
 * crea uno para la descarga). La variante "marca" embebe el logo al
 * centro con corrección de error 'H' (~30% de oclusión tolerada → sigue
 * escaneando). Si el logo no carga, degrada a un QR válido sin marca.
 */
export async function renderQrCanvas(opts: {
  text: string
  size: number
  style: QrStyle
  canvas?: HTMLCanvasElement
}): Promise<HTMLCanvasElement> {
  const { text, size, style } = opts
  const canvas = opts.canvas ?? document.createElement('canvas')
  const withLogo = style === 'marca'

  await toCanvas(canvas, text, {
    width: size,
    margin: 2,
    // Corrección de error baja = menos módulos = más legible y prolijo.
    // 'L' para el pelado; 'Q' (25% de tolerancia) para el de marca, que
    // alcanza de sobra para el logo chico del centro.
    errorCorrectionLevel: withLogo ? 'Q' : 'L',
    color: { dark: withLogo ? '#001C38' : '#000000', light: '#ffffff' },
  })

  if (withLogo) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      try {
        const logo = await loadImage(LOGO_SRC)
        const box = Math.round(size * 0.2)
        const pos = Math.round((size - box) / 2)
        const pad = Math.round(box * 0.14)
        ctx.fillStyle = '#ffffff'
        roundedRectPath(
          ctx,
          pos - pad,
          pos - pad,
          box + pad * 2,
          box + pad * 2,
          Math.round(box * 0.2),
        )
        ctx.fill()
        ctx.drawImage(logo, pos, pos, box, box)
      } catch {
        // Logo opcional: si falla, el QR pelado ya quedó dibujado y es válido.
      }
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
