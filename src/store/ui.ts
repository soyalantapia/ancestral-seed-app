import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  isMobileMenuOpen: boolean
  dismissedBanners: Record<string, boolean>
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  dismissBanner: (id: string) => void
  resetDemoState: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      dismissedBanners: {},
      toggleMobileMenu: () =>
        set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      dismissBanner: (id) =>
        set((s) => ({
          dismissedBanners: { ...s.dismissedBanners, [id]: true },
        })),
      resetDemoState: () => {
        localStorage.clear()
        window.location.href = '/'
      },
    }),
    {
      name: 'ancestral-seed-ui',
      partialize: (s) => ({ dismissedBanners: s.dismissedBanners }),
    },
  ),
)
