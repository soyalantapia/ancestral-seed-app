import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/features/Layout'
import { RequireAuth } from '@/components/features/RequireAuth'
import { RequireTutor } from '@/components/features/RequireTutor'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Wrapper de `lazy()` con retry automático para resolver el error
 *   "Importing a module script failed" / "Failed to fetch dynamically
 *   imported module"
 *
 * Esto pasa típicamente después de un deploy: el `index.js` cacheado
 * en el browser apunta a chunks (`Home-OLDHASH.js`) que ya no existen.
 * El primer fallo gatilla un reload automático (una sola vez por
 * sesión) para tomar el bundle nuevo. Si después del reload sigue
 * fallando, propaga el error al ErrorBoundary.
 */
function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const STORAGE_KEY = 'ancestral-seed-chunk-reload'
    try {
      const mod = await factory()
      // Éxito: recién ACÁ limpiamos el flag. (Antes se limpiaba en cada
      // boot del bundle, lo que anulaba el guard "recargar una sola vez":
      // con un chunk persistentemente desactualizado —p. ej. index.html
      // cacheado apuntando a un chunk borrado— la página entraba en loop
      // de reloads. Ahora un fallo recarga UNA vez y, si sigue fallando,
      // cae al ErrorBoundary en lugar de trabarse recargando.)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
      return mod
    } catch (err) {
      const alreadyReloaded =
        typeof window !== 'undefined' &&
        window.sessionStorage.getItem(STORAGE_KEY) === '1'
      if (!alreadyReloaded && typeof window !== 'undefined') {
        window.sessionStorage.setItem(STORAGE_KEY, '1')
        window.location.reload()
        // Promise pendiente: el reload mata el script antes de resolver
        return new Promise<{ default: T }>(() => {})
      }
      throw err
    }
  })
}

// Lazy pages — cada route se descarga on-demand
const Home = lazyWithRetry(() => import('@/pages/Home'))
const Directory = lazyWithRetry(() => import('@/pages/Directory'))
const CertificationDetail = lazyWithRetry(() => import('@/pages/CertificationDetail'))
const AuthorProfile = lazyWithRetry(() => import('@/pages/AuthorProfile'))
const Verify = lazyWithRetry(() => import('@/pages/Verify'))
const Login = lazyWithRetry(() => import('@/pages/Login'))
const Signup = lazyWithRetry(() => import('@/pages/Signup'))
const RecoverPassword = lazyWithRetry(() => import('@/pages/RecoverPassword'))
const CertifyForm = lazyWithRetry(() => import('@/pages/CertifyForm'))
const MyCertifications = lazyWithRetry(() => import('@/pages/MyCertifications'))
const CertificationRequest = lazyWithRetry(() => import('@/pages/CertificationRequest'))
const MyProfile = lazyWithRetry(() => import('@/pages/MyProfile'))
const Notifications = lazyWithRetry(() => import('@/pages/Notifications'))
const Help = lazyWithRetry(() => import('@/pages/Help'))
const Nosotros = lazyWithRetry(() => import('@/pages/Nosotros'))
const Pagos = lazyWithRetry(() => import('@/pages/Pagos'))
const Calendario = lazyWithRetry(() => import('@/pages/Calendario'))
const TutorDashboard = lazyWithRetry(() => import('@/pages/tutor/TutorDashboard'))
const TutorCases = lazyWithRetry(() => import('@/pages/tutor/TutorCases'))
const TutorCaseDetail = lazyWithRetry(() => import('@/pages/tutor/TutorCaseDetail'))
const TutorCertifications = lazyWithRetry(() => import('@/pages/tutor/TutorCertifications'))
const TutorCertificationDetail = lazyWithRetry(() => import('@/pages/tutor/TutorCertificationDetail'))
const TutorAgenda = lazyWithRetry(() => import('@/pages/tutor/TutorAgenda'))
const TutorTasks = lazyWithRetry(() => import('@/pages/tutor/TutorTasks'))
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'))
const Legal = lazyWithRetry(() => import('@/pages/Legal'))
const Legislacion = lazyWithRetry(() => import('@/pages/Legislacion'))
// Fix análisis proyecto — páginas nuevas Ola 2 + Ola 3
const Renovar = lazyWithRetry(() => import('@/pages/Renovar'))
const Apelar = lazyWithRetry(() => import('@/pages/Apelar'))
const PlanMejora = lazyWithRetry(() => import('@/pages/PlanMejora'))
const Denuncias = lazyWithRetry(() => import('@/pages/Denuncias'))
const MisDatos = lazyWithRetry(() => import('@/pages/MisDatos'))
const BuyerWallet = lazyWithRetry(() => import('@/pages/comprador/BuyerWallet'))
const CoordinadorEquipo = lazyWithRetry(
  () => import('@/pages/coordinador/CoordinadorEquipo'),
)

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-10 md:px-8 md:py-14">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  )
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: withSuspense(<Home />) },
        { path: 'directorio', element: withSuspense(<Directory />) },
        { path: 'nosotros', element: withSuspense(<Nosotros />) },
        { path: 'certificado/:slug', element: withSuspense(<CertificationDetail />) },
        { path: 'autor/:slug', element: withSuspense(<AuthorProfile />) },
        { path: 'perfil/:slug', element: withSuspense(<AuthorProfile />) },
        { path: 'verificar', element: withSuspense(<Verify />) },
        { path: 'login', element: withSuspense(<Login />) },
        { path: 'registro', element: withSuspense(<Signup />) },
        { path: 'recuperar', element: withSuspense(<RecoverPassword />) },
        { path: 'certificar', element: withSuspense(<CertifyForm />) },
        // Apartado "Legislación" — marco legal por país / consulta previa.
        // Ruta estática antes de legal/:section para que gane el matcher.
        { path: 'legal/legislacion', element: withSuspense(<Legislacion />) },
        { path: 'legal/:section', element: withSuspense(<Legal />) },
        // Fix #FEAT-06: denuncia pública sin login
        { path: 'denuncias', element: withSuspense(<Denuncias />) },
      ],
    },
    {
      path: '/',
      element: <RequireAuth />,
      children: [
        // Inicio eliminado: la página principal del postulante es ahora
        // "Mis certificaciones". /inicio redirige para no romper enlaces viejos.
        { path: 'inicio', element: <Navigate to="/mis-certificaciones" replace /> },
        { path: 'mis-certificaciones', element: withSuspense(<MyCertifications />) },
        { path: 'mis-certificaciones/:id', element: withSuspense(<CertificationRequest />) },
        { path: 'mi-perfil', element: withSuspense(<MyProfile />) },
        { path: 'notificaciones', element: withSuspense(<Notifications />) },
        { path: 'calendario', element: withSuspense(<Calendario />) },
        { path: 'pagos', element: withSuspense(<Pagos />) },
        // Documentos eliminado: certificados se ven en el detalle de la
        // certificación y las facturas viven en Pagos.
        { path: 'documentos', element: <Navigate to="/mis-certificaciones" replace /> },
        // Configuración eliminada: métodos de pago viven en Pagos y "cambiar
        // contraseña" en el menú de usuario. La ruta redirige por enlaces viejos.
        { path: 'configuracion', element: <Navigate to="/pagos" replace /> },
        { path: 'ayuda', element: withSuspense(<Help />) },
        { path: 'dashboard', element: <Navigate to="/mis-certificaciones" replace /> },
        // Fix #FEAT-02: renovación
        {
          path: 'mis-certificaciones/:id/renovar',
          element: withSuspense(<Renovar />),
        },
        // Fix #FEAT-03: apelación
        {
          path: 'mis-certificaciones/:id/apelar',
          element: withSuspense(<Apelar />),
        },
        // Fix #FEAT-08: plan de mejora
        {
          path: 'mis-certificaciones/:id/plan-mejora',
          element: withSuspense(<PlanMejora />),
        },
        // Fix #FEAT-13: derechos del titular de datos
        { path: 'mis-datos', element: withSuspense(<MisDatos />) },
        // Fix #FEAT-01: rol Comprador B2B
        { path: 'comprador/wallet', element: withSuspense(<BuyerWallet />) },
        // Fix #FEAT-04 + 11: rol Coordinador
        {
          path: 'coordinador/equipo',
          element: withSuspense(<CoordinadorEquipo />),
        },
      ],
    },
    {
      path: '/tutor',
      element: <RequireTutor />,
      children: [
        { index: true, element: <Navigate to="/tutor/dashboard" replace /> },
        { path: 'dashboard', element: withSuspense(<TutorDashboard />) },
        { path: 'casos', element: withSuspense(<TutorCases />) },
        { path: 'casos/:id', element: withSuspense(<TutorCaseDetail />) },
        { path: 'agenda', element: withSuspense(<TutorAgenda />) },
        { path: 'tareas', element: withSuspense(<TutorTasks />) },
        { path: 'certificaciones', element: withSuspense(<TutorCertifications />) },
        { path: 'certificaciones/:id', element: withSuspense(<TutorCertificationDetail />) },
      ],
    },
    { path: '*', element: withSuspense(<NotFound />) },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
)
