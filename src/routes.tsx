import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/features/Layout'
import Home from '@/pages/Home'
import Directory from '@/pages/Directory'
import CertificationDetail from '@/pages/CertificationDetail'
import AuthorProfile from '@/pages/AuthorProfile'
import Verify from '@/pages/Verify'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter([
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
    ],
  },
  { path: '*', element: <NotFound /> },
])
