import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setSession: (user: User, token: string) => void
  clearSession: () => void
}

/**
 * Asegura que `user` tenga `role`/`roles` antes de persistir.
 *
 * Usado para:
 *   - migrate (v0→v1): backfilla users legacy persistidos antes de Sprint A
 *     que no tenían los nuevos campos. Sin esto, los users viejos quedan
 *     atrapados en 403 al ir a /tutor.
 *   - setSession: si el backend mock devuelve un user sin roles (puede
 *     pasar si MSW no aplicó el handler nuevo), aplica el mismo default.
 *
 * Default conservador para la demo: postulante + tutor. En producción
 * con backend real, el migrate haría un refetch a /api/me en vez de
 * adivinar.
 */
function normalizeUser(user: User | null): User | null {
  if (!user) return user
  const role: UserRole = user.role ?? 'postulante'
  const roles =
    user.roles && user.roles.length > 0
      ? user.roles
      : ['postulante' as UserRole, 'tutor' as UserRole]
  return { ...user, role, roles }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setSession: (user, token) =>
        set({ user: normalizeUser(user), token, isAuthenticated: true }),
      clearSession: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'ancestral-seed-auth',
      version: 1,
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as Partial<AuthState>
        // v0 → v1: el User pre-Sprint A no tenía role/roles. Backfill.
        if (version < 1) {
          state.user = normalizeUser(state.user ?? null)
        }
        return state as AuthState
      },
    },
  ),
)
