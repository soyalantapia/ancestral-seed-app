import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Stub mínimo de localStorage para zustand persist en jsdom.
// jsdom a veces no provee Storage propiamente — definimos uno in-memory.
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
  const store: Record<string, string> = {}
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = String(v)
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length
    },
  }
}

// Limpieza automática del DOM entre tests
afterEach(() => {
  cleanup()
})

// jsdom no implementa matchMedia — lo stubeamos para que no rompa
// hooks que lo consumen (e.g. theme detection).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// IntersectionObserver stub para componentes lazy con observer
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  // @ts-expect-error stub mínimo para jsdom
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}
