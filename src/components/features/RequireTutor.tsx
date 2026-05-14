import { Navigate, useLocation } from 'react-router-dom'
import { TutorLayout } from './TutorLayout'
import { useAuthStore } from '@/store/auth'

export function RequireTutor() {
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

  return <TutorLayout />
}
