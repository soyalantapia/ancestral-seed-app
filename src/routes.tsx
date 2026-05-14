import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/features/Layout'
import { RequireAuth } from '@/components/features/RequireAuth'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy pages — cada route se descarga on-demand
const Home = lazy(() => import('@/pages/Home'))
const Directory = lazy(() => import('@/pages/Directory'))
const CertificationDetail = lazy(() => import('@/pages/CertificationDetail'))
const AuthorProfile = lazy(() => import('@/pages/AuthorProfile'))
const Verify = lazy(() => import('@/pages/Verify'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const RecoverPassword = lazy(() => import('@/pages/RecoverPassword'))
const CertifyForm = lazy(() => import('@/pages/CertifyForm'))
const DashboardHome = lazy(() => import('@/pages/DashboardHome'))
const MyCertifications = lazy(() => import('@/pages/MyCertifications'))
const CertificationRequest = lazy(() => import('@/pages/CertificationRequest'))
const MyProfile = lazy(() => import('@/pages/MyProfile'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Settings = lazy(() => import('@/pages/Settings'))
const Help = lazy(() => import('@/pages/Help'))
const Nosotros = lazy(() => import('@/pages/Nosotros'))
const NotFound = lazy(() => import('@/pages/NotFound'))

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
      ],
    },
    {
      path: '/',
      element: <RequireAuth />,
      children: [
        { path: 'inicio', element: withSuspense(<DashboardHome />) },
        { path: 'mis-certificaciones', element: withSuspense(<MyCertifications />) },
        { path: 'mis-certificaciones/:id', element: withSuspense(<CertificationRequest />) },
        { path: 'mi-perfil', element: withSuspense(<MyProfile />) },
        { path: 'notificaciones', element: withSuspense(<Notifications />) },
        { path: 'configuracion', element: withSuspense(<Settings />) },
        { path: 'ayuda', element: withSuspense(<Help />) },
        { path: 'dashboard', element: <Navigate to="/inicio" replace /> },
      ],
    },
    { path: '*', element: withSuspense(<NotFound />) },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
)
