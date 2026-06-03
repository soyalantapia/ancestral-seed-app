import { Link, Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { TutorLayout } from './TutorLayout'
import { useAuthStore } from '@/store/auth'

/**
 * Guarda la sección `/tutor/*` detrás de:
 *   1. autenticación obligatoria
 *   2. rol `tutor` en `user.role` o `user.roles`
 *
 * Si el usuario está autenticado pero no es tutor, mostramos un 403
 * inline (no redirigimos al login para no confundir — está logueado,
 * solo no tiene permiso). Mantiene la URL para que un admin pueda
 * compartir el link y el usuario sepa qué pidió acceder.
 */
export function RequireTutor() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  // Legacy bypass: si el user no tiene `role` ni `roles` (persistido antes
  // de Sprint A o de un backend que no incluye el campo), permitimos acceso
  // — en la demo el único usuario es mockUser que es multi-rol. La migración
  // del store ya backfillea estos campos al rehidratar, así que este branch
  // solo cubre el race window entre carga del bundle nuevo y rehidratación.
  const hasNoRoleInfo =
    !!user && user.role === undefined && (user.roles?.length ?? 0) === 0

  const isTutor =
    hasNoRoleInfo ||
    user?.role === 'tutor' ||
    user?.role === 'admin' ||
    user?.roles?.includes('tutor') === true ||
    user?.roles?.includes('admin') === true

  if (!isTutor) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-100 text-warning-400">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-navy-500">
          Acceso restringido
        </h1>
        <p className="mt-2 text-sm text-navy-300">
          El panel de tutor está reservado para usuarios con rol{' '}
          <strong className="text-navy-500">tutor</strong>. Si pensás que esto
          es un error, escribinos a{' '}
          <a
            href="mailto:soporte@ancestralseed.org"
            className="font-bold text-gold-700 hover:underline"
          >
            soporte@ancestralseed.org
          </a>
          .
        </p>
        <Link
          to="/mis-certificaciones"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-navy-500 px-5 text-sm font-bold text-white shadow-sm hover:bg-navy-400"
        >
          Volver a mi panel
        </Link>
      </div>
    )
  }

  return <TutorLayout />
}
