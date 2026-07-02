import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Award,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRight,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Flag,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Network,
  QrCode,
  Search as SearchIcon,
  Send,
  Share2,
  ShieldCheck,
  Sprout,
  Star,
  Users,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCertification } from '@/hooks/useCertifications'
import { useEscape } from '@/hooks/useEscape'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { PageMeta } from '@/components/features/PageMeta'
import { CategoryBadge } from '@/components/features/CategoryBadge'
import { LicenseStatusBadge } from '@/components/features/LicenseStatusBadge'
import { QrDownloadModal } from '@/components/features/QrDownloadModal'
import { api } from '@/services/api'
import { cn, formatDate, imgFallback } from '@/lib/utils'
import { OFFICIAL_DOCS } from '@/lib/copy'
import { certPublicUrl, renderQrCanvas } from '@/lib/qr'

const PLACEHOLDER = '__placeholder__'
const isPlaceholder = (v: string) => v === PLACEHOLDER || !v

function resolveAsset(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${import.meta.env.BASE_URL}${url.replace(/^\//, '')}`
}

/** Fallbacks si una imagen real todavía no se subió (degradan con gracia). */
const COVER_FALLBACK = `${import.meta.env.BASE_URL}cards/card-filigrana-v2.webp`
const AVATAR_FALLBACK = 'https://i.pravatar.cc/200?img=47'

const reportSchema = z.object({
  reason: z.string().min(3, 'Indicá un motivo'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
})
type ReportForm = z.infer<typeof reportSchema>

export default function CertificationDetail() {
  const { slug } = useParams()
  const { data: cert, isLoading, error } = useCertification(slug)
  const [showReport, setShowReport] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [showBlockchain, setShowBlockchain] = useState(false)
  const [showVerified, setShowVerified] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  if (isLoading) return <DetailSkeleton />
  if (error || !cert) return <DetailError message={error ?? 'No encontrado'} />

  const authorName = isPlaceholder(cert.authorName) ? 'Autor' : cert.authorName
  const authorSlug = cert.authorSlug ?? cert.authorId
  const region =
    cert.location ??
    (isPlaceholder(cert.category)
      ? 'Sin región declarada'
      : cert.category)
  const mapQuery = cert.mapQuery ?? region

  const galleryUrls = (
    cert.galleryUrls?.length
      ? cert.galleryUrls
      : [cert.coverUrl, cert.coverUrl, cert.coverUrl, cert.coverUrl]
  ).map(resolveAsset)

  const handleDownload = async () => {
    // Fix SB9 (#PUB-15, auditoría UX): antes la "Descarga" entregaba un
    // .json crudo que no servía para mostrar/imprimir. Ahora generamos
    // PDF real con jsPDF.
    const { buildCertificatePdf, downloadPdfBlob } = await import('@/lib/pdf')
    const blob = buildCertificatePdf({
      title: cert.title,
      authorName,
      region,
      issuedBy: cert.issuedBy,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      hash: cert.hash,
      description: cert.description,
      verifyUrl:
        typeof window !== 'undefined' ? window.location.href : undefined,
    })
    downloadPdfBlob(`${cert.slug}-certificado.pdf`, blob)
    toast.success('Certificado descargado')
  }

  const ogImage =
    cert.coverUrl?.startsWith('http')
      ? cert.coverUrl
      : typeof window !== 'undefined'
        ? `${window.location.origin}${import.meta.env.BASE_URL}${(cert.coverUrl ?? '').replace(/^\//, '')}`
        : undefined

  return (
    <>
      <PageMeta
        title={cert.title}
        description={
          cert.description?.slice(0, 160) ??
          `Certificado ${cert.title} por ${authorName} — ${region}.`
        }
        image={ogImage}
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: cert.title,
          description: cert.description,
          image: ogImage,
          brand: { '@type': 'Brand', name: authorName },
          countryOfOrigin: region,
          award: cert.issuedBy ? `Certificado por ${cert.issuedBy}` : undefined,
          additionalProperty: cert.hash
            ? [
                {
                  '@type': 'PropertyValue',
                  name: 'Blockchain Hash',
                  value: cert.hash,
                },
              ]
            : undefined,
        }}
      />
      {/* Decorative chevron pattern strip */}
      <div className="bg-pattern-strip h-16 md:h-24" aria-hidden />

      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
          {/* Badges del Reglamento 2.1.1 + cap. 5 — arriba del título
              porque comunican la naturaleza del certificado antes que el
              nombre del producto. */}
          {(cert.officialCategory || cert.licenseStatus) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {cert.officialCategory && (
                <CategoryBadge category={cert.officialCategory} />
              )}
              {cert.licenseStatus && (
                <LicenseStatusBadge status={cert.licenseStatus} />
              )}
            </div>
          )}
          <h1 className="text-2xl font-bold leading-tight text-navy-500 md:text-[32px]">
            {cert.title}
          </h1>
          {cert.licenseNumber && (
            <p className="mt-2 text-xs font-medium uppercase tracking-widest text-navy-300">
              N° de licencia ·{' '}
              <span className="font-bold text-navy-500">
                {cert.licenseNumber}
              </span>
              {cert.licenseValidUntil && (
                <>
                  {' '}
                  · Vigente hasta{' '}
                  <span className="font-bold text-navy-500">
                    {new Date(cert.licenseValidUntil).toLocaleDateString(
                      'es-AR',
                      { day: '2-digit', month: 'long', year: 'numeric' },
                    )}
                  </span>
                </>
              )}
            </p>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* LEFT: Cover image — Figma 587x455 ≈ 1.29:1 */}
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                <img
                  src={resolveAsset(cert.coverUrl)}
                  alt={cert.title}
                  onError={imgFallback(COVER_FALLBACK)}
                  className="aspect-[587/455] w-full object-cover"
                />
              </div>
            </div>

            {/* RIGHT: Action buttons + Author card + Stats */}
            <div className="space-y-5 lg:col-span-6">
              {/* Fix QW-B2 (auditoría UX): los labels antes prometían
                  más de lo que entregaban. "Ver en Blockchain" hacía
                  esperar Polygonscan directo (es modal interno que sí
                  linkea afuera, ahora lo comunicamos con ícono
                  ExternalLink). "Ver Certificado Verificado" era
                  redundante ("verlo" si ya estoy en la ficha). */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlockchain(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-gold-400"
                >
                  <Network className="h-4 w-4" />
                  Ver registro blockchain
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerified(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Ver certificado oficial
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </button>
                <button
                  type="button"
                  onClick={() => setShowQr(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  <QrCode className="h-4 w-4" />
                  Código QR
                </button>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 md:p-7">
                <div className="flex items-center gap-4">
                  <img
                    src={cert.authorAvatarUrl || AVATAR_FALLBACK}
                    alt={authorName}
                    onError={imgFallback(AVATAR_FALLBACK)}
                    className="h-16 w-16 rounded-full border border-neutral-200 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-navy-300">Autor</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-base font-bold text-navy-500">
                        {authorName}
                      </p>
                      {!isPlaceholder(cert.authorName) && (
                        <Link
                          to={`/perfil/${authorSlug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                        >
                          <span>Ver Perfil</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-7 border-t border-neutral-200 pt-5">
                  {/* Fix SM2 (#PUB-14): antes "Puntaje 100/100" hardcoded
                      en todos los certs — se devaluaba. Ahora mostramos
                      la fecha de auditoría que es información concreta y
                      única por cert. */}
                  <Stat
                    icon={Star}
                    label="Auditado"
                    value={formatDate(cert.issuedAt)}
                    iconBg="bg-gold-500"
                    iconColor="text-navy-500"
                  />
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-500">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-navy-300">Estado</p>
                      <span className="mt-0.5 inline-block rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-300 ring-1 ring-success-300/20">
                        Vigente
                      </span>
                    </div>
                  </div>
                  <Stat
                    icon={Calendar}
                    label="Fecha de emisión"
                    value={formatDate(cert.issuedAt)}
                    iconBg="bg-gold-500"
                    iconColor="text-navy-500"
                  />
                  <Stat
                    icon={Calendar}
                    label="Fecha de vigencia"
                    value={cert.expiresAt ? formatDate(cert.expiresAt) : 'Indefinida'}
                    iconBg="bg-gold-500"
                    iconColor="text-navy-500"
                  />
                </div>

                {cert.contact && (
                  <div className="mt-5 space-y-3 border-t border-neutral-200 pt-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
                      Contacto y pedidos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cert.contact.catalogUrl && (
                        <a
                          href={cert.contact.catalogUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex h-10 items-center gap-2 rounded-full bg-gold-500 px-4 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
                        >
                          <Download className="h-4 w-4" />
                          Descargar catálogo
                          {cert.contact.catalogLabel
                            ? ` · ${cert.contact.catalogLabel}`
                            : ''}
                        </a>
                      )}
                      {cert.contact.whatsappUrl && (
                        <a
                          href={cert.contact.whatsappUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex h-10 items-center gap-2 rounded-full bg-success-300 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-success-400"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                          {cert.contact.whatsappLabel
                            ? ` · ${cert.contact.whatsappLabel}`
                            : ''}
                        </a>
                      )}
                      {cert.contact.instagramUrl && (
                        <a
                          href={cert.contact.instagramUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                        >
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </a>
                      )}
                      {cert.contact.facebookUrl && (
                        <a
                          href={cert.contact.facebookUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Facebook
                        </a>
                      )}
                      {cert.contact.websiteUrl && (
                        <a
                          href={cert.contact.websiteUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                        >
                          <Globe className="h-4 w-4" />
                          Tienda online
                        </a>
                      )}
                    </div>
                    {cert.contact.addressLine && (
                      <p className="flex items-start gap-2 text-xs text-navy-300">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-700" />
                        {cert.contact.addressLine}
                      </p>
                    )}
                    {cert.contact.notes && cert.contact.notes.length > 0 && (
                      <ul className="space-y-1">
                        {cert.contact.notes.map((n) => (
                          <li
                            key={n}
                            className="flex items-center gap-2 text-xs text-navy-300"
                          >
                            <Check className="h-3 w-3 shrink-0 text-success-300" />
                            {n}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-200 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowContact(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-100 px-4 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-200"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Contactar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShare(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-100 px-4 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-200"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Compartir
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-100 px-4 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-200"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Reportar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 pb-10 md:px-8 md:pb-12">
          <div className="bg-white px-1 md:px-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy-500">
              <Users className="h-4 w-4 text-gold-700" />
              Comunidad y región
            </h2>
            <p className="mt-3 text-sm font-semibold text-navy-500">{region}</p>
            {(cert.contextParagraphs ?? []).map((p, i) => (
              <p
                key={`ctx-${i}`}
                className="mt-3 text-sm leading-relaxed text-navy-300"
              >
                {p}
              </p>
            ))}

            <h2 className="mt-10 flex items-center gap-2 text-base font-bold text-navy-500">
              <Sprout className="h-4 w-4 text-gold-700" />
              Técnica y producción
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-300">
              {cert.description}
            </p>
            {(cert.techniqueParagraphs ?? []).map((p, i) => (
              <p
                key={`tech-${i}`}
                className="mt-3 text-sm leading-relaxed text-navy-300"
              >
                {p}
              </p>
            ))}

            <Gallery
              urls={galleryUrls}
              index={galleryIndex}
              setIndex={setGalleryIndex}
              onOpen={(i) => setLightboxIndex(i)}
            />

            <MapPreview region={region} mapQuery={mapQuery} />
          </div>
        </div>
      </section>

      {/* Documentación oficial — Reglamento 1.4 obliga a que el documento
          esté disponible electrónicamente. Va antes de Methodology porque
          es el "contrato" sobre el cual se sostiene todo lo anterior. */}
      <OfficialDocsSection />

      <MethodologySection />

      <ReportSheet
        open={showReport}
        onClose={() => setShowReport(false)}
        certificationId={cert.id}
      />

      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        title={cert.title}
        author={authorName}
        url={certPublicUrl(cert.slug)}
        hash={cert.hash}
      />

      <QrDownloadModal
        open={showQr}
        onClose={() => setShowQr(false)}
        slug={cert.slug}
        title={cert.title}
      />

      <BlockchainModal
        open={showBlockchain}
        onClose={() => setShowBlockchain(false)}
        hash={cert.hash}
        issuedAt={cert.issuedAt}
        title={cert.title}
      />

      <VerifiedCertificateModal
        open={showVerified}
        onClose={() => setShowVerified(false)}
        cert={cert}
        authorName={authorName}
        region={region}
        onDownload={handleDownload}
      />

      <ContactSheet
        open={showContact}
        onClose={() => setShowContact(false)}
        author={authorName}
        certTitle={cert.title}
      />

      <Lightbox
        urls={galleryUrls}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={(i) => setLightboxIndex(i)}
      />
    </>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  iconBg = 'bg-gold-100',
  iconColor = 'text-gold-700',
}: {
  icon: typeof Award
  label: string
  value: string
  iconBg?: string
  iconColor?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          iconBg,
          iconColor,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-navy-300">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-navy-500">{value}</p>
      </div>
    </div>
  )
}

function Gallery({
  urls,
  index,
  setIndex,
  onOpen,
}: {
  urls: string[]
  index: number
  setIndex: (n: number) => void
  onOpen: (i: number) => void
}) {
  const items = urls
  return (
    <div className="relative mt-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((src, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onOpen(i)}
            aria-label={`Abrir imagen ${i + 1} de ${items.length}`}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <img
              src={src}
              alt=""
              onError={imgFallback(COVER_FALLBACK)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-500/0 opacity-0 transition-opacity group-hover:bg-navy-500/30 group-hover:opacity-100">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-navy-500">
                Ampliar
              </span>
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => {
          const next = Math.max(0, index - 1)
          setIndex(next)
          onOpen(next)
        }}
        className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold-500 text-navy-500 shadow-lg transition-all hover:scale-110 hover:bg-gold-400 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => {
          const next = Math.min(items.length - 1, index + 1)
          setIndex(next)
          onOpen(next)
        }}
        className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold-500 text-navy-500 shadow-lg transition-all hover:scale-110 hover:bg-gold-400 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

function MapPreview({ region, mapQuery }: { region: string; mapQuery: string }) {
  const q = encodeURIComponent(mapQuery)
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200">
      <div className="relative aspect-[16/7] bg-neutral-100">
        <iframe
          title={`Mapa de ${region}`}
          src={`https://www.google.com/maps?q=${q}&t=m&z=7&ie=UTF8&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy-500 shadow">
          {region}
          <a
            href={`https://www.google.com/maps/search/${q}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto ml-2 inline-flex items-center gap-1 text-gold-700 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * Sección de documentación oficial — Reglamento 1.4.
 *
 * Muestra el Reglamento de Marca como documento descargable con
 * metadata (tamaño, páginas, última actualización). Servido desde
 * /public/docs/ → respeta BASE_URL automáticamente.
 */
function OfficialDocsSection() {
  const doc = OFFICIAL_DOCS.reglamentoMarca
  const href = `${import.meta.env.BASE_URL}${doc.path}`
  return (
    <section className="mb-10 bg-gold-50 md:mb-16">
      <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-8 md:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Explicación en lenguaje claro — para que cualquiera entienda
              qué es este documento antes de abrirlo. */}
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">
              <FileCheck2 className="h-4 w-4" strokeWidth={2} />
              Documentación oficial
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-navy-500 md:text-[28px]">
              Cómo se usa el Sello Ancestral Seed
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-300 md:text-base">
              El{' '}
              <strong className="font-semibold text-navy-500">
                Reglamento de uso de la Marca
              </strong>{' '}
              es la guía oficial para quienes reciben el Sello. Está escrito en
              lenguaje claro y explica, sin vueltas, qué representa y cómo se
              usa.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                'Qué significan las categorías: Auténtico, Tradicional e Inspiración cultural.',
                'Cómo, dónde y en qué condiciones se puede mostrar el Sello.',
                'Los derechos y compromisos de cada titular de la certificación.',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-navy-500"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card de descarga */}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir o descargar ${doc.title} en PDF`}
            className="group flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
                <FileCheck2 className="h-7 w-7" strokeWidth={1.85} />
              </span>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-navy-400">
                PDF
              </span>
            </div>
            <p className="mt-5 text-lg font-bold leading-snug text-navy-500 group-hover:text-gold-700">
              {doc.title}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-navy-300">
              <span>{doc.sizeKb} KB</span>
              <span aria-hidden className="text-neutral-300">
                ·
              </span>
              <span>{doc.pages} páginas</span>
              <span aria-hidden className="text-neutral-300">
                ·
              </span>
              <span>
                Actualizado el{' '}
                {new Date(doc.updatedAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </p>
            <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-navy-500 px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-navy-400">
              <Download className="h-4 w-4" />
              Leer o descargar
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

function MethodologySection() {
  const items: { label: string; icon: typeof SearchIcon }[] = [
    { label: 'Auditoría\nPersonalizada', icon: SearchIcon },
    { label: 'Verificación\nComunitaria', icon: Users },
    { label: 'Integridad\nBlockchain', icon: Network },
    { label: 'Criterios\nPonderados', icon: FileCheck2 },
  ]
  return (
    <section className="relative overflow-hidden mb-12 md:mb-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}methodology-bg.webp')`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-navy-500/90 via-navy-500/80 to-navy-500/90"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 py-14 text-center text-white md:px-8 md:py-20">
        <h2 className="text-2xl font-bold md:text-[32px] md:leading-tight">
          Nuestra metodología de certificación
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-200 md:text-base">
          Combinamos auditoría humana, validación comunitaria y blockchain para
          garantizar que cada certificación refleje el origen, la trazabilidad
          y el valor cultural del producto.
        </p>
        <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:mt-12 md:grid-cols-4 md:gap-5">
          {items.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-2xl bg-gold-500 px-4 py-5 text-left shadow-md ring-1 ring-gold-700/10 md:px-5"
            >
              <Icon
                className="h-8 w-8 shrink-0 text-navy-500 md:h-9 md:w-9"
                strokeWidth={1.75}
              />
              <span className="whitespace-pre-line text-sm font-bold leading-[1.15] text-navy-500 md:text-base">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ReportSheet({
  open,
  onClose,
  certificationId,
}: {
  open: boolean
  onClose: () => void
  certificationId: string
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportForm>({ resolver: zodResolver(reportSchema) })

  const onSubmit = async (data: ReportForm) => {
    try {
      await api.reportIncident({ certificationId, ...data })
      toast.success('Reporte enviado · Te contactamos en 48hs')
      reset()
      onClose()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reportar incidencia"
      description="Si encontraste un dato erróneo o sospecha de fraude, contanos."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="reason">Motivo</Label>
          <select
            id="reason"
            className="mt-2 h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            {...register('reason')}
          >
            <option value="">Seleccioná un motivo…</option>
            <option value="dato-erroneo">Dato erróneo</option>
            <option value="autoria-incorrecta">Autoría incorrecta</option>
            <option value="sospecha-fraude">Sospecha de fraude</option>
            <option value="otro">Otro</option>
          </select>
          {errors.reason && (
            <p className="mt-1 text-xs font-medium text-error-400">
              {errors.reason.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            rows={4}
            placeholder="Contanos qué encontraste…"
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs font-medium text-error-400">
              {errors.description.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="navy"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando…' : 'Enviar reporte'}
        </Button>
      </form>
    </Sheet>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-8">
      <Skeleton className="h-10 w-3/4" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Skeleton className="aspect-square lg:col-span-6" />
        <div className="space-y-3 lg:col-span-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

function DetailError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-navy-500">
        Certificado no encontrado
      </h1>
      <p className="mt-2 text-sm text-navy-300">{message}</p>
      <Link
        to="/directorio"
        className={cn(buttonVariants({ variant: 'gold', size: 'md' }), 'mt-6')}
      >
        Volver al directorio
      </Link>
    </div>
  )
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({
  open,
  onClose,
  title,
  author,
  url,
  hash,
}: {
  open: boolean
  onClose: () => void
  title: string
  author: string
  url: string
  hash: string
}) {
  useEscape(open, onClose)
  const qrRef = useRef<HTMLCanvasElement>(null)

  // QR generado localmente (sin servicio externo): se redibuja al abrir.
  useEffect(() => {
    if (!open) return
    const canvas = qrRef.current
    if (!canvas) return
    renderQrCanvas({ text: url, size: 200, style: 'simple', canvas }).catch(() => {})
  }, [open, url])

  if (!open) return null

  const text = `Conocé "${title}" — certificación cultural ancestral por ${author}. Ficha verificable en Ancestral Seed.`
  const encoded = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  const links = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}%20${encoded}`,
      color: 'bg-success-300 hover:bg-success-400 text-white',
    },
    {
      name: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encoded}`,
      color: 'bg-navy-500 hover:bg-navy-400 text-white',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: 'bg-info-400 hover:bg-info-300 text-white',
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      color: 'bg-info-300 hover:bg-info-400 text-white',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encoded}`,
      color: 'bg-neutral-200 hover:bg-neutral-300 text-navy-500',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-bold text-navy-500">Compartir ficha</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          {/* QR — generado localmente (sin servicio externo) */}
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-neutral-200 bg-white p-3">
            <canvas
              ref={qrRef}
              width={200}
              height={200}
              role="img"
              aria-label={`Código QR para ${title}`}
              className="h-full w-full"
            />
          </div>

          <p className="mt-3 text-center text-xs text-navy-300">
            Escaneá este código para abrir la ficha pública
          </p>

          {/* URL */}
          <div className="mt-5">
            <p className="text-xs font-bold text-navy-500">Link directo</p>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2">
              <input
                readOnly
                value={url}
                className="flex-1 truncate bg-transparent text-xs text-navy-500 focus:outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(url)
                  toast.success('Link copiado')
                }}
                className="rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-navy-500 transition-colors hover:bg-gold-400"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Hash */}
          <div className="mt-3">
            <p className="text-xs font-bold text-navy-500">Hash blockchain</p>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2">
              <code className="flex-1 truncate text-[10px] text-navy-500">{hash}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(hash)
                  toast.success('Hash copiado')
                }}
                className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-300"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Social */}
          <p className="mt-6 text-xs font-bold text-navy-500">O compartí en</p>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {links.map((l) => (
              <a
                key={l.name}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[10px] font-bold transition-all',
                  l.color,
                )}
              >
                {l.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Blockchain Modal ─────────────────────────────────────────────────────────

function BlockchainModal({
  open,
  onClose,
  hash,
  issuedAt,
  title,
}: {
  open: boolean
  onClose: () => void
  hash: string
  issuedAt: string
  title: string
}) {
  useEscape(open, onClose)
  if (!open) return null
  /**
   * Fix #FEAT-05 + ADR-0002 (análisis proyecto): antes el modal
   * mostraba "Polygon Mainnet" y linkeaba a polygonscan que devolvía
   * "No matching results found" — riesgo reputacional. Ahora copy
   * honesto "Vista previa institucional · activación Q3 2026" y el
   * link al explorador queda DESACTIVADO con tooltip explicativo.
   *
   * El hash sigue mostrándose porque es un ID único interno (sirve
   * para QR físico + verificación cross). El bloque mock se conserva
   * para el visual pero se etiqueta como "Bloque previsto".
   */
  const network = 'Polygon Amoy (testnet) — previsto Q3 2026'
  const blockNumber =
    52_000_000 + (parseInt(hash.slice(2, 8), 16) % 200_000)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="blockchain-title"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 id="blockchain-title" className="text-lg font-bold text-navy-500">
            Registro en blockchain
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-700 ring-4 ring-gold-100/60">
            <Network className="h-7 w-7" />
          </div>
          <p className="mt-4 text-center text-xs uppercase tracking-widest text-warning-400">
            Vista previa institucional
          </p>
          <p className="mt-1 text-center text-sm font-bold text-navy-500">
            {title}
          </p>

          {/* Fix #FEAT-05: disclaimer claro al inicio del modal */}
          <div className="mt-4 rounded-2xl border border-warning-300 bg-warning-100/40 p-3 text-xs leading-relaxed text-navy-500">
            <p className="font-bold text-warning-400">
              Modo demo institucional
            </p>
            <p className="mt-1">
              El registro on-chain real se activa en producción a partir
              del Q3 2026 (red Polygon Amoy → mainnet). Los datos abajo
              representan la metadata que será sellada en blockchain. El
              hash es un identificador único que también valida el QR
              físico del producto.
            </p>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <KV label="Red prevista">{network}</KV>
            <KV label="Bloque (estimado)">
              #{blockNumber.toLocaleString('es-AR')}
            </KV>
            <KV label="Fecha de sellado">{formatDate(issuedAt)}</KV>
          </dl>

          <div className="mt-5">
            <p className="text-xs font-bold text-navy-500">Hash de transacción</p>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2">
              <code className="flex-1 truncate text-[10px] text-navy-500">
                {hash}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(hash)
                  toast.success('Hash copiado al portapapeles')
                }}
                className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-navy-500 transition-colors hover:bg-gold-400"
              >
                <Copy className="h-3 w-3" />
                Copiar
              </button>
            </div>
          </div>

          {/* Fix #FEAT-05: link a explorador deshabilitado mientras la
              integración real está pendiente. Antes devolvía 404 en
              polygonscan y dañaba la credibilidad. */}
          <button
            type="button"
            disabled
            title="Disponible cuando se active la integración Q3 2026"
            className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-dashed border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-navy-300"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir en explorador · pendiente Q3 2026
          </button>
          <p className="mt-3 text-center text-[11px] text-navy-300">
            Decisión documentada en{' '}
            <code className="text-navy-500">
              docs/adr/0002-blockchain-disclaimer-vs-integracion.md
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-navy-300">{label}</dt>
      <dd className="text-sm font-semibold text-navy-500">{children}</dd>
    </div>
  )
}

// ─── Verified Certificate Modal ───────────────────────────────────────────────

function VerifiedCertificateModal({
  open,
  onClose,
  cert,
  authorName,
  region,
  onDownload,
}: {
  open: boolean
  onClose: () => void
  cert: { title: string; issuedBy: string; issuedAt: string; expiresAt?: string; hash: string }
  authorName: string
  region: string
  onDownload: () => void
}) {
  useEscape(open, onClose)
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verified-title"
        // Fix SB15 (#PUB-18, auditoría UX): print isolation. La clase
        // `printable-cert` la usa el global CSS de print en index.css
        // para ocultar todo lo demás cuando window.print() se ejecuta
        // desde el botón "Imprimir" del footer del modal.
        className="printable-cert w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 id="verified-title" className="text-lg font-bold text-navy-500">
            Certificado verificado
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Certificate "paper" */}
        <div className="bg-pattern-gold p-4 md:p-8">
          <div className="relative overflow-hidden rounded-2xl border-4 border-gold-500 bg-white p-6 md:p-10">
            <span className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold-500/10" aria-hidden />
            <span className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-navy-500/5" aria-hidden />

            <div className="relative text-center">
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold-700">
                Ancestral Seed
              </p>
              <p className="mt-1 text-xs text-navy-300">
                Certificación cultural · Registro inmutable en blockchain
              </p>
              <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-300 text-white shadow-lg">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-success-300">
                Verificado
              </p>
              <h3 className="mt-2 text-xl font-bold leading-tight text-navy-500 md:text-2xl">
                {cert.title}
              </h3>
              <p className="mt-2 text-sm text-navy-300">
                a nombre de <span className="font-bold text-navy-500">{authorName}</span>
              </p>
              <p className="mt-0.5 text-xs text-navy-300">{region}</p>

              <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left">
                <MiniKV label="Emisor" value={cert.issuedBy} />
                <MiniKV label="Emitido" value={formatDate(cert.issuedAt)} />
                <MiniKV
                  label="Vigencia"
                  value={cert.expiresAt ? formatDate(cert.expiresAt) : 'Indefinida'}
                />
                <MiniKV label="Estado" value="Vigente" tone="success" />
              </div>

              <div className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 text-left">
                <p className="text-[10px] uppercase tracking-widest text-navy-300">
                  Hash blockchain
                </p>
                <code className="mt-1 block break-all text-[10px] font-medium text-navy-500">
                  {cert.hash}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              window.print()
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}

function MiniKV({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success'
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-navy-300">{label}</p>
      <p
        className={cn(
          'mt-0.5 text-sm font-bold',
          tone === 'success' ? 'text-success-300' : 'text-navy-500',
        )}
      >
        {value}
      </p>
    </div>
  )
}

// ─── Contact Sheet ────────────────────────────────────────────────────────────

const contactSchema = z.object({
  fromName: z.string().min(2, 'Tu nombre completo'),
  fromEmail: z.string().email('Email inválido'),
  message: z.string().min(10, 'Mínimo 10 caracteres'),
})
type ContactForm = z.infer<typeof contactSchema>

function ContactSheet({
  open,
  onClose,
  author,
  certTitle,
}: {
  open: boolean
  onClose: () => void
  author: string
  certTitle: string
}) {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (data: ContactForm) => {
    await new Promise((r) => setTimeout(r, 500))
    // En prod, esto golpearía /api/contact con cert id + author id
    void data
    setSent(true)
    toast.success('Mensaje enviado al autor')
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSent(false)
      reset()
    }, 250)
  }

  return (
    <Sheet
      open={open}
      onClose={handleClose}
      title={sent ? '¡Mensaje enviado!' : `Contactar a ${author}`}
      description={
        sent
          ? undefined
          : `Tu mensaje llegará junto al contexto de "${certTitle}"`
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-300 text-white shadow-lg">
            <Check className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-300">
            {author} te responderá por email en las próximas 72 horas hábiles.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 inline-flex h-10 items-center rounded-full bg-navy-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fromName">Tu nombre</Label>
            <input
              id="fromName"
              autoComplete="name"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              {...register('fromName')}
            />
            {errors.fromName && (
              <p className="mt-1 text-xs font-medium text-error-400">
                {errors.fromName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="fromEmail">Tu email</Label>
            <input
              id="fromEmail"
              type="email"
              autoComplete="email"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              {...register('fromEmail')}
            />
            {errors.fromEmail && (
              <p className="mt-1 text-xs font-medium text-error-400">
                {errors.fromEmail.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="message">Mensaje</Label>
            <textarea
              id="message"
              rows={5}
              placeholder={`Hola ${author.split(' ')[0] ?? ''}, me interesa…`}
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none"
              {...register('message')}
            />
            {errors.message && (
              <p className="mt-1 text-xs font-medium text-error-400">
                {errors.message.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="navy"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
          </Button>
          <p className="text-center text-[11px] text-navy-300">
            Tu email solo se comparte con el autor. No publicamos tus datos.
          </p>
        </form>
      )}
    </Sheet>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  urls,
  index,
  onClose,
  onChange,
}: {
  urls: string[]
  index: number | null
  onClose: () => void
  onChange: (i: number) => void
}) {
  const open = index !== null
  useEscape(open, onClose)

  // Arrow keys navigation + block body scroll while open
  useEffect(() => {
    if (!open || typeof window === 'undefined') return
    const onKey = (e: KeyboardEvent) => {
      if (index === null) return
      if (e.key === 'ArrowLeft' && index > 0) onChange(index - 1)
      if (e.key === 'ArrowRight' && index < urls.length - 1) onChange(index + 1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, index, urls.length, onChange])

  if (index === null) return null
  const current = urls[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galería de imágenes"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-500/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        disabled={index === 0}
        onClick={(e) => {
          e.stopPropagation()
          onChange(Math.max(0, index - 1))
        }}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 md:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <img
        src={current}
        alt={`Imagen ${index + 1} de ${urls.length}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
      />

      <button
        type="button"
        disabled={index === urls.length - 1}
        onClick={(e) => {
          e.stopPropagation()
          onChange(Math.min(urls.length - 1, index + 1))
        }}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 md:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
        {index + 1} / {urls.length}
      </div>
    </div>
  )
}
