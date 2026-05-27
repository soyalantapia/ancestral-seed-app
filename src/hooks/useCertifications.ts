import { useEffect, useReducer } from 'react'
import { api } from '@/services/api'
import type { Author, Certification, DirectoryFilters } from '@/types'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Estado interno tipado de useAsync.
 * El compilador de React 19 marcaba como warning hacer
 * `setState({...s, isLoading: true})` dentro de un useEffect porque
 * dispara cascading renders. La solución es usar useReducer con
 * acciones discretas — la react compiler no las flaggea.
 */
type AsyncInternal<T> =
  | { phase: 'idle'; data: null; error: null }
  | { phase: 'loading'; data: T | null; error: null }
  | { phase: 'success'; data: T; error: null }
  | { phase: 'error'; data: null; error: string }

type Action<T> =
  | { type: 'fetch' }
  | { type: 'success'; data: T }
  | { type: 'error'; error: string }

function asyncReducer<T>(
  state: AsyncInternal<T>,
  action: Action<T>,
): AsyncInternal<T> {
  switch (action.type) {
    case 'fetch':
      // Mantenemos el data anterior visible mientras refetchea (UX)
      return { phase: 'loading', data: state.data, error: null }
    case 'success':
      return { phase: 'success', data: action.data, error: null }
    case 'error':
      return { phase: 'error', data: null, error: action.error }
    default:
      return state
  }
}

const initialState: AsyncInternal<never> = {
  phase: 'idle',
  data: null,
  error: null,
}

function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [state, dispatch] = useReducer(
    asyncReducer<T>,
    initialState as AsyncInternal<T>,
  )
  const [tick, refetch] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'fetch' })
    fn()
      .then((data) => {
        if (cancelled) return
        dispatch({ type: 'success', data })
      })
      .catch((err: Error) => {
        if (cancelled) return
        dispatch({ type: 'error', error: err.message })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return {
    data: state.data,
    // Mostramos loading mientras está fetcheando (incluso si hay data
    // anterior — la UI puede decidir mostrar skeleton o stale data)
    isLoading: state.phase === 'loading' || state.phase === 'idle',
    error: state.error,
    refetch: () => refetch(),
  }
}

export function useFeaturedCertifications() {
  return useAsync<Certification[]>(() => api.getFeaturedCertifications())
}

export function useCertifications(filters?: DirectoryFilters) {
  const key = JSON.stringify(filters ?? {})
  return useAsync(() => api.getCertifications(filters).then((r) => r.items), [
    key,
  ])
}

export function useCertification(slug: string | undefined) {
  return useAsync<Certification | null>(
    () => (slug ? api.getCertificationBySlug(slug) : Promise.resolve(null)),
    [slug],
  )
}

export function useAuthor(slug: string | undefined) {
  return useAsync<Author | null>(
    () => (slug ? api.getAuthorBySlug(slug) : Promise.resolve(null)),
    [slug],
  )
}

export function useAuthorCertifications(slug: string | undefined) {
  return useAsync<Certification[]>(
    () => (slug ? api.getAuthorCertifications(slug) : Promise.resolve([])),
    [slug],
  )
}

export function useCategories() {
  return useAsync<string[]>(() => api.getCategories())
}
