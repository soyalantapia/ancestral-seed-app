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
      const id = rawHash.replace('#', '')
      if (!id) return
      // Poll acotado hasta que el elemento exista. Un 2-rAF fijo fallaba
      // al navegar DESDE otra ruta (o deep-link /#seccion): la Home es
      // pesada y su sección aún no está montada en los primeros frames,
      // así que getElementById daba null y no scrolleaba. Reintentamos
      // ~30 frames (≈0.5s) y cortamos.
      let frames = 0
      const tryScroll = () => {
        const el = document.getElementById(id)
        if (el) {
          // Offset manual restando header sticky (64 mobile / 80 desktop)
          const headerH = window.innerWidth >= 768 ? 80 : 64
          const top = el.getBoundingClientRect().top + window.scrollY - headerH
          window.scrollTo({ top, behavior: 'smooth' })
        } else if (frames++ < 30) {
          window.requestAnimationFrame(tryScroll)
        }
      }
      window.requestAnimationFrame(tryScroll)
    }

    // Con hash → scrollear a la sección. Sin hash → ruta nueva (ej:
    // "Certificar" → /certificar): React Router NO resetea el scroll, así que
    // la página siguiente abría scrolleada donde había quedado la anterior
    // (bug reportado: "me lleva al final, no al principio"). Reset al tope
    // INSTANTÁNEO (pisa el `scroll-behavior: smooth` global; si no, la página
    // "viaja" animada desde el fondo). Usamos `window.location.hash` como
    // respaldo por si el location de React Router llega desfasado, para no
    // pisar nunca una navegación con hash con el reset al tope.
    const targetHash = hash || window.location.hash
    if (targetHash) {
      scrollToHash(targetHash)
    } else {
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
