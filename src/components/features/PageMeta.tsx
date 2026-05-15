import { Helmet } from 'react-helmet-async'

/**
 * Componente "drop-in" para meta tags por ruta.
 *
 * Reglas:
 * - `title` aparece como `<title>` y como `og:title` (concatena " · Ancestral Seed" salvo en `/`).
 * - `description` se inyecta en `<meta name="description">`, `og:description` y `twitter:description`.
 * - `image` es absoluta (preferentemente desde `import.meta.env.BASE_URL`); si es relativa al BASE_URL,
 *   armar con `${import.meta.env.BASE_URL}assets/og.png` antes de pasarla.
 * - `noindex` agrega `<meta name="robots" content="noindex">` para vistas privadas.
 * - `jsonLd` permite inyectar un schema.org JSON-LD (Product, Person, BreadcrumbList, etc.)
 *   para que Google rinda rich snippets en fichas públicas.
 *
 * Uso típico en una página:
 *   <PageMeta
 *     title="Filigrana ancestral"
 *     description="Producto certificado por Ancestral Seed."
 *     image={absoluteCoverUrl}
 *     jsonLd={{ '@context': 'https://schema.org', '@type': 'Product', ... }}
 *   />
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
  'Validamos la autenticidad de productos y saberes originarios mediante un sistema de certificación cultural, auditoría y tecnología blockchain.'

export function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  noindex = false,
  canonical,
  jsonLd,
}: PageMetaProps) {
  const fullTitle = title ? `${title} · ${SUFFIX}` : SUFFIX
  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Ancestral Seed" />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
