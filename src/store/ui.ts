import { create } from 'zustand'

interface UiState {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  resetDemoState: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  resetDemoState: () => {
    localStorage.clear()
    window.location.href = '/'
  },
}))
