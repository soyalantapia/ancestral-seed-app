import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Cuando React Router navega a una URL con hash (ej: `/#beneficios`),
 * por defecto solo cambia el pathname y NO scrollea al elemento con
 * ese id.
 *
 * Este componente escucha cambios de location.hash y, si hay un hash,
 * busca el elemento con ese id en el DOM y scrollea suavemente hacia él.
 *
 * Bug reportado por Mario: "Beneficios y ¿Cómo funciona? vuelven a la
 * portada en vez de scrollear a la sección." Causa raíz: ausencia de
 * este comportamiento.
 *
 * Bug detectado en QA (mayo 2026): cuando el usuario YA estaba en la
 * misma ruta y clickea una pestaña que solo cambia el hash, el
 * useEffect dependiente de [pathname, hash] no se re-dispara
 * confiablemente porque react-router-dom v7 puede no actualizar el
 * location.hash en navegaciones same-path. Fix: agregar un listener
 * nativo de `hashchange` como fallback robusto.
 */
export function HashScrollHandler() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const scrollToHash = (rawHash: string) => {
      if (!rawHash) return
      const id = rawHash.replace('#', '')
      if (!id) return
      // 2 frames: 1 para que React haya commiteado, otro para layout
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const el = document.getElementById(id)
          if (!el) return
          // Offset manual restando header sticky (64 mobile / 80 desktop)
          const headerH = window.innerWidth >= 768 ? 80 : 64
          const top = el.getBoundingClientRect().top + window.scrollY - headerH
          window.scrollTo({ top, behavior: 'smooth' })
        })
      })
    }

    // 1) Trigger cuando cambia el pathname/hash via React Router
    if (hash) {
      scrollToHash(hash)
    } else {
      // Sin hash → navegación a una ruta nueva (ej: "Certificar" → /certificar).
      // React Router NO resetea el scroll, así que la página siguiente abría
      // scrolleada donde había quedado la anterior (bug reportado: "me lleva
      // al final, no al principio"). Reseteamos al tope. INSTANTÁNEO
      // (behavior:'instant') para pisar el `scroll-behavior: smooth` global del
      // CSS — si no, la página "viaja" animada desde el fondo, que se ve peor.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }

    // 2) Fallback: listener nativo de hashchange para clicks que solo
    //    cambian el hash dentro de la misma ruta (no triggerea
    //    re-render de Layout y useLocation puede no actualizar)
    const onHashChange = () => scrollToHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [pathname, hash])

  return null
}
