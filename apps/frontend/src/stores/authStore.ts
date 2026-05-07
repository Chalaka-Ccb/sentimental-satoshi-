import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string } | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: { id: string; email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'satoshi-auth',
      // Only persist refreshToken — access token should not survive page reload
      partialize: (s) => ({ refreshToken: s.refreshToken }),
    }
  )
);