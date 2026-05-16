import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

export type AvatarType = 'initials' | 'illustrated' | 'photo'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  avatarUrl: string | null
  avatarType: AvatarType
  illustratedAvatarId: string
  hasHydrated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  updateAvatar: (url: string | null) => void
  setAvatarIllustrated: (id: string) => void
  setAvatarInitials: () => void
  refreshUser: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      avatarUrl: null,
      avatarType: 'initials' as AvatarType,
      illustratedAvatarId: 'a1',
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
      updateAvatar: (url) => set({ avatarUrl: url, avatarType: url ? 'photo' : 'initials' }),
      setAvatarIllustrated: (id) => set({ illustratedAvatarId: id, avatarType: 'illustrated', avatarUrl: null }),
      setAvatarInitials: () => set({ avatarType: 'initials', avatarUrl: null }),
      refreshUser: async () => {
        const token = get().token
        if (!token) return
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            set({ user: data, isAuthenticated: true })
          }
        } catch {}
      },
      logout: () => {
        localStorage.removeItem('aeforyn_token')
        localStorage.removeItem('aeforyn-auth')
        set({ user: null, token: null, isAuthenticated: false, avatarUrl: null, avatarType: 'initials', illustratedAvatarId: 'a1' })
      },
    }),
    {
      name: 'aeforyn-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        avatarUrl: state.avatarUrl,
        avatarType: state.avatarType,
        illustratedAvatarId: state.illustratedAvatarId,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true })
      },
    }
  )
)
