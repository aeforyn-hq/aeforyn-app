import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  avatarUrl: string | null
  hasHydrated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  updateAvatar: (url: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      avatarUrl: null,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('aeforyn_token', token)
        } else {
          localStorage.removeItem('aeforyn_token')
        }
        set({ token })
      },
      updateAvatar: (url) => set({ avatarUrl: url }),
      logout: () => {
        localStorage.removeItem('aeforyn_token')
        localStorage.removeItem('aeforyn-auth')
        set({ user: null, token: null, isAuthenticated: false, avatarUrl: null })
      },
    }),
    {
      name: 'aeforyn-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        avatarUrl: state.avatarUrl,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true })
      },
    }
  )
)
