import { Helmet } from 'react-helmet-async'

/**
 * Componente "drop-in" para meta tags por ruta.
 *
 * Reglas:
 * - `title` aparece como `<title>` y como `og:title`.
 * - `description` se inyecta en `<meta name="description">`, `og:description`
 *   y `twitter:description`.
 * - `image` se prefiere absoluta. Si no se pasa, fallback al OG default
 *   (`/og-image.png`) — así CUALQUIER ruta tiene preview rico en WhatsApp.
 * - `canonical` arma la URL absoluta; si no se pasa, deriva de la URL actual.
 * - `noindex` agrega robots noindex,nofollow para vistas privadas.
 * - `jsonLd` permite inyectar schema.org JSON-LD.
 *
 * Fix SM7 (preview WhatsApp): antes muchas rutas no pasaban `image`,
 * así que WhatsApp mostraba un preview con texto pelado. Ahora el
 * fallback al OG default garantiza preview SIEMPRE con imagen.
 */
interface PageMetaProps {
  title?: string
  description?: string
  image?: string
  noindex?: boolean
  canonical?: string
  /** schema.org JSON-LD, p.ej. Product, Person, BreadcrumbList. */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}

const SUFFIX = 'Ancestral Seed · Certificación digital'

const DEFAULT_DESCRIPTION =
  'Validamos saberes ancestrales con auditoría cultural y blockchain inmutable. Plataforma de certificación digital.'

/**
 * URL absoluta del sitio en producción. Se usa para que og:image y
 * canonical funcionen sin importar dónde se renderice el HTML — los
 * crawlers de WhatsApp/X/etc no ejecutan JS y necesitan absolutas.
 */
const SITE_URL = 'https://soyalantapia.github.io/ancestral-seed-app'

/**
 * Imagen OG default — 1200×630 PNG en /public/og-image.png. Generada
 * por `scripts/generate-og.mjs` a partir del SVG fuente.
 */
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

/**
 * Si la URL pasada es relativa, la prefijamos con SITE_URL. Si ya es
 * absoluta (https://), la dejamos como está. Para BASE_URL local
 * convertimos a absoluta de prod.
 */
function toAbsolute(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${SITE_URL}${url}`
  return `${SITE_URL}/${url}`
}

export function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  noindex = false,
  canonical,
  jsonLd,
}: PageMetaProps) {
  const fullTitle = title ? `${title} · ${SUFFIX}` : SUFFIX
  /**
   * Fix V2-PUB-07 (auditoría v2): antes el fallback de OG image se
   * aplicaba a CUALQUIER ruta — incluso las marcadas `noindex` (panel
   * del solicitante, kanban del tutor, etc.). Si alguien pegaba un
   * link de `/inicio` por WhatsApp, el preview rico podía sugerir
   * que esa URL era pública. Para rutas `noindex` ahora omitimos
   * tanto image como el JSON-LD: el preview queda mínimo, sin
   * sugerir "contenido público". Solo las rutas públicas usan el
   * OG default automático.
   */
  const allowRichPreview = !noindex
  const ogImage = image
    ? toAbsolute(image)
    : allowRichPreview
      ? DEFAULT_OG_IMAGE
      : null
  const canonicalUrl =
    canonical ??
    (typeof window !== 'undefined' ? window.location.href : SITE_URL)
  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Ancestral Seed" />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:url" content={canonicalUrl} />
      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta
            property="og:image:alt"
            content={title ? `${title} — Ancestral Seed` : 'Ancestral Seed · Certificación digital'}
          />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:site" content="@ancestralseed" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* JSON-LD solo en rutas indexables — evita filtrar metadata
          estructurada de pantallas privadas. */}
      {jsonLd && allowRichPreview && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
