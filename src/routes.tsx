import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/features/Layout'
import { RequireAuth } from '@/components/features/RequireAuth'
import Home from '@/pages/Home'
import Directory from '@/pages/Directory'
import CertificationDetail from '@/pages/CertificationDetail'
import AuthorProfile from '@/pages/AuthorProfile'
import Verify from '@/pages/Verify'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import RecoverPassword from '@/pages/RecoverPassword'
import CertifyForm from '@/pages/CertifyForm'
import DashboardHome from '@/pages/DashboardHome'
import MyCertifications from '@/pages/MyCertifications'
import CertificationRequest from '@/pages/CertificationRequest'
import MyProfile from '@/pages/MyProfile'
import Notifications from '@/pages/Notifications'
import Settings from '@/pages/Settings'
import Help from '@/pages/Help'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'directorio', element: <Directory /> },
        { path: 'certificado/:slug', element: <CertificationDetail /> },
        { path: 'autor/:slug', element: <AuthorProfile /> },
        { path: 'perfil/:slug', element: <AuthorProfile /> },
        { path: 'verificar', element: <Verify /> },
        { path: 'login', element: <Login /> },
        { path: 'registro', element: <Signup /> },
        { path: 'recuperar', element: <RecoverPassword /> },
        { path: 'certificar', element: <CertifyForm /> },
      ],
    },
    {
      path: '/',
      element: <RequireAuth />,
      children: [
        { path: 'inicio', element: <DashboardHome /> },
        { path: 'mis-certificaciones', element: <MyCertifications /> },
        { path: 'mis-certificaciones/:id', element: <CertificationRequest /> },
        { path: 'mi-perfil', element: <MyProfile /> },
        { path: 'notificaciones', element: <Notifications /> },
        { path: 'configuracion', element: <Settings /> },
        { path: 'ayuda', element: <Help /> },
        { path: 'dashboard', element: <Navigate to="/inicio" replace /> },
      ],
    },
    { path: '*', element: <NotFound /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
)
