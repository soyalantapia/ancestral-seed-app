/**
 * Recuperación de Service Workers "huérfanos".
 *
 * Bug de fondo ("Algo salió mal cargando los certificados"): un SW ajeno a
 * MSW —típicamente un Workbox/PWA de una versión anterior— queda
 * CONTROLANDO la página del usuario. Mientras eso pasa, MSW no puede
 * interceptar `/api/*`: los fetch salen a la red y el server responde el
 * SPA-fallback (`index.html`, `text/html`), rompiendo la carga de datos.
 *
 * El `sw.js` que sirve hoy la app es self-destroying, pero un browser que
 * registró el Workbox VIEJO (antes de `selfDestroying: true`) lo sigue
 * usando hasta que el browser actualice el SW —lo que puede tardar horas—.
 * Estas funciones lo desregistran ACTIVAMENTE para que MSW tome control.
 *
 * A diferencia del guard one-shot anterior (`sw-purged-v1`, que se rendía
 * tras un único intento y dejaba al cliente pegado si la recarga perdía la
 * race), acá usamos un contador acotado: reintenta hasta MAX_PURGE_RELOADS
 * veces por sesión, y se resetea solo cuando el estado queda sano.
 */

const PURGE_ATTEMPTS_KEY = 'ancestral-seed:sw-purge-attempts'
const MAX_PURGE_RELOADS = 3

function isMswScript(scriptUrl: string): boolean {
  return scriptUrl.includes('mockServiceWorker.js')
}

/** ¿Hay un SW que NO es el de MSW controlando esta página? */
export function orphanControllerPresent(): boolean {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return false
  const ctrl = navigator.serviceWorker.controller
  return !!ctrl && !isMswScript(ctrl.scriptURL)
}

function readAttempts(): number {
  try {
    return Number(sessionStorage.getItem(PURGE_ATTEMPTS_KEY) || '0')
  } catch {
    return 0
  }
}

/**
 * Desregistra los SW huérfanos + limpia el Cache API y recarga UNA vez para
 * que MSW pueda registrarse limpio.
 *
 * @returns `true` si disparó una recarga (el caller debe CORTAR su flujo:
 *          la página se está yendo). `false` si no había nada que purgar o
 *          si ya se agotó el presupuesto de reloads.
 */
export async function purgeOrphanServiceWorkers(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  let regs: readonly ServiceWorkerRegistration[]
  try {
    regs = await navigator.serviceWorker.getRegistrations()
  } catch {
    return false
  }

  const orphans = regs.filter((reg) => {
    const url =
      reg.active?.scriptURL ||
      reg.waiting?.scriptURL ||
      reg.installing?.scriptURL ||
      ''
    return url !== '' && !isMswScript(url)
  })

  if (orphans.length === 0) {
    // Estado sano → resetear el contador para un futuro episodio.
    try {
      sessionStorage.removeItem(PURGE_ATTEMPTS_KEY)
    } catch {
      /* ignore */
    }
    return false
  }

  if (readAttempts() >= MAX_PURGE_RELOADS) {
    // No loopear infinito si por algún motivo el SW no se puede sacar:
    // dejamos que la app siga (degradada) en vez de recargar sin fin.
    return false
  }

  for (const reg of orphans) {
    try {
      // eslint-disable-next-line no-console
      console.warn(
        `[sw-recovery] Desregistrando SW huérfano: ${reg.active?.scriptURL || reg.scope}`,
      )
      await reg.unregister()
    } catch {
      /* ignore */
    }
  }

  // El SW viejo pudo haber precacheado el shell → limpiar todo para no
  // servir una versión vieja tras la recarga.
  if (typeof caches !== 'undefined') {
    try {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n)))
    } catch {
      /* ignore */
    }
  }

  try {
    sessionStorage.setItem(PURGE_ATTEMPTS_KEY, String(readAttempts() + 1))
  } catch {
    /* ignore */
  }

  window.location.reload()
  return true
}
