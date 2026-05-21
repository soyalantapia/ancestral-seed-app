import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Cuando React Router navega a una URL con hash (ej: `/#beneficios`), por
 * defecto solo cambia el pathname y NO scrollea al elemento con ese id.
 *
 * Este componente escucha cambios de location.hash y, si hay un hash,
 * busca el elemento con ese id en el DOM y scrollea suavemente hacia él.
 *
 * Bug reportado por Mario: "Beneficios y ¿Cómo funciona? vuelven a la
 * portada en vez de scrollear a la sección." Causa raíz: ausencia de este
 * comportamiento.
 *
 * Se monta una sola vez en el Layout público. No renderea nada visible.
 *
 * Comportamiento:
 *   1. En cada cambio de location, si hash existe → buscar #id.
 *   2. Hacer scrollIntoView con smooth behavior + block: 'start'.
 *   3. Pequeño delay (50ms) para esperar a que la nueva ruta haya
 *      montado los elementos antes de buscar.
 *   4. Si el elemento no existe en este pathname, no-op silencioso.
 */
export function HashScrollHandler() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    if (!id) return

    // Esperar al próximo tick para que la ruta nueva haya renderizado
    // los elementos. 50ms cubre la mayoría de casos sin ser perceptible.
    const t = setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
    return () => clearTimeout(t)
  }, [pathname, hash])

  return null
}
