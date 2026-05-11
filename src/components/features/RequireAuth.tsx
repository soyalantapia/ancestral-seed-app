import { Navigate, useLocation } from 'react-router-dom'
import { DashboardLayout } from './DashboardLayout'
import { useAuthStore } from '@/store/auth'

export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
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

  return <DashboardLayout />
}
