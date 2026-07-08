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
    let rafId = 0
    const timeouts: number[] = []
    const scrollToHash = (rawHash: string) => {
      const id = rawHash.replace('#', '')
      if (!id) return
      // Offset manual restando header sticky (64 mobile / 80 desktop)
      const doScroll = (el: HTMLElement) => {
        const headerH = window.innerWidth >= 768 ? 80 : 64
        const top = el.getBoundingClientRect().top + window.scrollY - headerH
        window.scrollTo({ top, behavior: 'smooth' })
      }
      // Poll acotado hasta que el elemento exista. Time-based (~3s) en vez
      // de 30 frames fijos (≈0.5s): las páginas LAZY (ej: /legal/legislacion,
      // deep-link a #colombia desde una ficha) pueden tardar >0.5s en montar
      // su chunk tras la navegación, y con el poll corto getElementById daba
      // null hasta que la ventana expiraba → el scroll no se disparaba nunca.
      let start: number | null = null
      const tryScroll = (ts: number) => {
        if (start === null) start = ts
        const el = document.getElementById(id)
        if (el) {
          doScroll(el)
          // Re-scroll correctivo tras la expansión de contenido que crece
          // DESPUÉS de este primer scroll (ej: un acordeón que se abre por
          // deep-link anima ~0.2s y desplaza el target; para el último item
          // de una lista el primer scrollTo pudo quedar clampeado contra el
          // layout aún colapsado). Re-medimos una vez pasada la animación.
          timeouts.push(
            window.setTimeout(() => {
              const again = document.getElementById(id)
              if (again) doScroll(again)
            }, 350),
          )
        } else if (ts - start < 3000) {
          rafId = window.requestAnimationFrame(tryScroll)
        }
      }
      rafId = window.requestAnimationFrame(tryScroll)
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
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      // Cancelar el poll y los re-scrolls pendientes al desmontar o al
      // navegar (evita que un poll viejo de ~3s pelee el scroll con la
      // navegación nueva).
      window.cancelAnimationFrame(rafId)
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [pathname, hash])

  return null
}
