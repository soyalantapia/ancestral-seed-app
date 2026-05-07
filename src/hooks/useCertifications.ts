import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { Author, Certification, DirectoryFilters } from '@/types'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [state, setState] = useState<{
    data: T | null
    isLoading: boolean
    error: string | null
  }>({ data: null, isLoading: true, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, isLoading: true, error: null }))
    fn()
      .then((data) => {
        if (cancelled) return
        setState({ data, isLoading: false, error: null })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setState({ data: null, isLoading: false, error: err.message })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, refetch: () => setTick((t) => t + 1) }
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
