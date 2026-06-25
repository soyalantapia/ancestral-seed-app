import { jsPDF } from 'jspdf'
import { LEGAL_ENTITY } from '@/lib/copy'

/**
 * Helpers para generar PDFs reales descargables — reemplaza los
 * `.txt` placeholder que la auditoría UX (#PUB-15 / #POS-35 / #TUT-28)
 * marcó como "promesa rota": el botón decía "Descargar" pero entregaba
 * un .txt feo que no servía para imprimir, mostrar a un comprador o
 * adjuntar a un mail comercial.
 *
 * Diseño compartido entre los 3 documentos:
 * - Header con sello Ancestral Seed (texto tipográfico — no incrustamos
 *   imagen para no inflar el bundle).
 * - Sección de datos clave.
 * - Footer con datos del Organismo (Reglamento 1.2).
 *
 * jsPDF se importa como side-effect dynamic-friendly. El bundle del
 * código del documento se splittea fuera del initial JS si los
 * callers usan `import('@/lib/pdf')`.
 */

const PALETTE = {
  navy: [0, 28, 56] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  text: [50, 50, 60] as [number, number, number],
  mute: [120, 120, 130] as [number, number, number],
}

function drawHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Banda superior navy
  doc.setFillColor(...PALETTE.navy)
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Wordmark
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('ANCESTRAL SEED', 14, 14)
  doc.setFontSize(8)
  doc.setTextColor(...PALETTE.gold)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICACIÓN DIGITAL', 14, 20)

  // Title del documento
  doc.setTextColor(...PALETTE.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, 14, 44)
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...PALETTE.mute)
    doc.text(subtitle, 14, 52)
  }
}

function drawKeyValue(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PALETTE.mute)
  doc.text(label.toUpperCase(), x, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...PALETTE.text)
  doc.text(value, x, y + 6)
}

function drawFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const y = pageHeight - 20

  doc.setDrawColor(220, 220, 225)
  doc.line(14, y - 4, pageWidth - 14, y - 4)
  doc.setFontSize(7)
  doc.setTextColor(...PALETTE.mute)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${LEGAL_ENTITY.name} · ${LEGAL_ENTITY.address} · ${LEGAL_ENTITY.email}`,
    14,
    y,
  )
  doc.text(
    `Generado el ${new Date().toLocaleString('es-AR')}`,
    14,
    y + 4,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Certificado público (#PUB-15)
// ─────────────────────────────────────────────────────────────────────────────

export interface CertificatePdfInput {
  title: string
  authorName: string
  region: string
  issuedBy: string
  issuedAt: string
  expiresAt?: string
  hash: string
  description?: string
  verifyUrl?: string
}

export function buildCertificatePdf(input: CertificatePdfInput): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, input.title, 'Certificado de autenticidad ancestral')

  let y = 64
  const left = 14
  const colGap = 95

  drawKeyValue(doc, left, y, 'A nombre de', input.authorName)
  drawKeyValue(doc, left + colGap, y, 'Territorio', input.region)
  y += 18

  drawKeyValue(doc, left, y, 'Emitido por', input.issuedBy)
  drawKeyValue(
    doc,
    left + colGap,
    y,
    'Fecha de emisión',
    new Date(input.issuedAt).toLocaleDateString('es-AR'),
  )
  y += 18

  if (input.expiresAt) {
    drawKeyValue(
      doc,
      left,
      y,
      'Vigente hasta',
      new Date(input.expiresAt).toLocaleDateString('es-AR'),
    )
    y += 18
  }

  if (input.description) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...PALETTE.mute)
    doc.text('DESCRIPCIÓN', left, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...PALETTE.text)
    const lines = doc.splitTextToSize(input.description, 180)
    doc.text(lines, left, y + 6)
    y += 6 + lines.length * 5 + 8
  }

  // Hash blockchain en monospace
  doc.setFillColor(245, 245, 248)
  doc.rect(left, y, 180, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PALETTE.mute)
  doc.text('HASH BLOCKCHAIN', left + 4, y + 6)
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PALETTE.text)
  const hashLines = doc.splitTextToSize(input.hash, 172)
  doc.text(hashLines, left + 4, y + 12)
  y += 28

  if (input.verifyUrl) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...PALETTE.mute)
    doc.text(`Verificá en: ${input.verifyUrl}`, left, y)
  }

  drawFooter(doc)
  return doc.output('blob')
}

// ─────────────────────────────────────────────────────────────────────────────
// Recibo de pago (#POS-35 facturas)
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentReceiptPdfInput {
  id: string
  concept: string
  requestNumber: string
  requestName: string
  amount: number
  currency: string
  status: string
  dueDate: string
  paidAt?: string
}

export function buildPaymentReceiptPdf(input: PaymentReceiptPdfInput): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, 'Comprobante de pago', input.concept)

  const fmtAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: input.currency,
    maximumFractionDigits: 0,
  }).format(input.amount)

  let y = 64
  const left = 14
  const colGap = 95

  drawKeyValue(doc, left, y, 'Identificador', input.id)
  drawKeyValue(
    doc,
    left + colGap,
    y,
    'Solicitud',
    `${input.requestNumber} · ${input.requestName}`,
  )
  y += 18

  drawKeyValue(doc, left, y, 'Monto', fmtAmount)
  drawKeyValue(doc, left + colGap, y, 'Estado', input.status.toUpperCase())
  y += 18

  drawKeyValue(
    doc,
    left,
    y,
    'Vencimiento',
    new Date(input.dueDate).toLocaleDateString('es-AR'),
  )
  if (input.paidAt) {
    drawKeyValue(
      doc,
      left + colGap,
      y,
      'Pagado el',
      new Date(input.paidAt).toLocaleString('es-AR'),
    )
  }

  drawFooter(doc)
  return doc.output('blob')
}

// ─────────────────────────────────────────────────────────────────────────────
// Recibo de evidencia subida (#POS-35 evidencias)
// ─────────────────────────────────────────────────────────────────────────────

export interface EvidenceReceiptPdfInput {
  id: string
  name: string
  kind: string
  sizeKb: number
  uploadedAt?: string
  thumbUrl?: string
}

export function buildEvidenceReceiptPdf(input: EvidenceReceiptPdfInput): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, 'Constancia de evidencia subida', input.name)

  let y = 64
  const left = 14
  const colGap = 95

  drawKeyValue(doc, left, y, 'ID de la evidencia', input.id)
  drawKeyValue(doc, left + colGap, y, 'Tipo', input.kind)
  y += 18

  drawKeyValue(
    doc,
    left,
    y,
    'Tamaño',
    input.sizeKb < 1024
      ? `${input.sizeKb} KB`
      : `${(input.sizeKb / 1024).toFixed(1)} MB`,
  )
  if (input.uploadedAt) {
    drawKeyValue(
      doc,
      left + colGap,
      y,
      'Fecha de carga',
      new Date(input.uploadedAt).toLocaleString('es-AR'),
    )
  }
  y += 18

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...PALETTE.mute)
  doc.text(
    'Este documento certifica que la evidencia identificada arriba fue',
    left,
    y,
  )
  doc.text(
    'subida a la plataforma Ancestral Seed y forma parte del expediente.',
    left,
    y + 5,
  )

  drawFooter(doc)
  return doc.output('blob')
}

// ─────────────────────────────────────────────────────────────────────────────
// Acta de emisión (tutor #TUT-28)
// ─────────────────────────────────────────────────────────────────────────────

export interface ActaPdfInput {
  certId: string
  productName: string
  authorName: string
  authorRole?: string
  community?: string
  productType?: string
  productSector?: string
  scoreLabel: string
  status: string
  category: string
  country?: string
  region?: string
  issuedAt: string
  expiresAt?: string
  hash?: string
}

export function buildActaPdf(input: ActaPdfInput): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, 'Acta de emisión de licencia', input.certId)

  let y = 64
  const left = 14
  const colGap = 95

  drawKeyValue(doc, left, y, 'Producto / Servicio', input.productName)
  drawKeyValue(doc, left + colGap, y, 'Categoría oficial', input.category)
  y += 18

  drawKeyValue(doc, left, y, 'Titular', input.authorName)
  if (input.authorRole) {
    drawKeyValue(doc, left + colGap, y, 'Rol', input.authorRole)
  }
  y += 18

  if (input.community) {
    drawKeyValue(doc, left, y, 'Comunidad / Pueblo', input.community)
  }
  if (input.country || input.region) {
    drawKeyValue(
      doc,
      left + colGap,
      y,
      'Territorio',
      [input.country, input.region].filter(Boolean).join(' · '),
    )
  }
  y += 18

  drawKeyValue(doc, left, y, 'Puntaje', input.scoreLabel)
  drawKeyValue(doc, left + colGap, y, 'Estado', input.status.toUpperCase())
  y += 18

  drawKeyValue(
    doc,
    left,
    y,
    'Emitido el',
    new Date(input.issuedAt).toLocaleDateString('es-AR'),
  )
  if (input.expiresAt) {
    drawKeyValue(
      doc,
      left + colGap,
      y,
      'Vigencia',
      new Date(input.expiresAt).toLocaleDateString('es-AR'),
    )
  }
  y += 18

  if (input.hash) {
    doc.setFillColor(245, 245, 248)
    doc.rect(left, y, 180, 22, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...PALETTE.mute)
    doc.text('HASH BLOCKCHAIN', left + 4, y + 6)
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...PALETTE.text)
    const hashLines = doc.splitTextToSize(input.hash, 172)
    doc.text(hashLines, left + 4, y + 12)
  }

  drawFooter(doc)
  return doc.output('blob')
}

/** Helper común para disparar el download del Blob. */
export function downloadPdfBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 200)
}
