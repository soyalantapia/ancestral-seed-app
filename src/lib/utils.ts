import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale = 'es-AR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Dispara la descarga de un archivo desde un string (texto/JSON/CSV/SVG).
 * Soporta los mimes más comunes; default text/plain.
 */
export function downloadBlob(
  filename: string,
  content: string | Blob,
  mime = 'text/plain;charset=utf-8',
): void {
  if (typeof window === 'undefined') return
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Genera un SVG simple de un QR placeholder (no es un QR real, es un
 * tablero pseudo-aleatorio determinístico a partir del payload).
 * Suficiente para prototipo / handoff a backend.
 */
export function buildPlaceholderQrSvg(payload: string, size = 256): string {
  // Hash determinístico del payload
  let h = 5381
  for (let i = 0; i < payload.length; i++) {
    h = (h * 33) ^ payload.charCodeAt(i)
  }
  const cells = 21
  const cell = Math.floor(size / cells)
  let rects = ''
  let seed = h >>> 0
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      // 3 finder patterns (esquinas)
      const isFinder =
        (x < 7 && y < 7) ||
        (x >= cells - 7 && y < 7) ||
        (x < 7 && y >= cells - 7)
      let on: boolean
      if (isFinder) {
        const inFx = x < 7 ? x : x - (cells - 7)
        const inFy = y < 7 ? y : y - (cells - 7)
        on =
          inFx === 0 ||
          inFx === 6 ||
          inFy === 0 ||
          inFy === 6 ||
          (inFx >= 2 && inFx <= 4 && inFy >= 2 && inFy <= 4)
      } else {
        seed = (seed * 1664525 + 1013904223) >>> 0
        on = (seed & 1) === 1
      }
      if (on) {
        rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="black"/>`
      }
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="white"/>${rects}</svg>`
}

/**
 * Convierte un array de objetos a CSV (con header) y devuelve el string.
 */
export function objectsToCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map((h) => escape((r as Record<string, unknown>)[h])).join(','))
  }
  return lines.join('\n')
}
