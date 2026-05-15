/**
 * Link "Saltar al contenido" visible solo cuando recibe foco con Tab.
 * Cumple con WCAG 2.4.1 (Bypass Blocks). Crítico para usuarios con lector
 * de pantalla y navegación por teclado: les ahorra tabular por todo el
 * header/sidebar antes de llegar al contenido.
 *
 * El target debe tener id="main-content" y tabIndex={-1} para que el
 * foco sea programático y no se vea un outline raro al click normal.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:left-4 focus:top-4 focus:z-[100]
        focus:inline-flex focus:items-center
        focus:rounded-full focus:bg-navy-500 focus:px-5 focus:py-2.5
        focus:text-sm focus:font-bold focus:text-white
        focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500
      "
    >
      Saltar al contenido
    </a>
  )
}
