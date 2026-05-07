import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string } | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: { id: string; email: string }) => void;
  logout: () => void;
}

const REFRESH_COOKIE_NAME = 'satoshi-refresh-token';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function writeRefreshCookie(refreshToken: string | null) {
  if (typeof document === 'undefined') return;

  if (!refreshToken) {
    document.cookie = `${REFRESH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}; Path=/; Max-Age=${REFRESH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) => {
        writeRefreshCookie(refreshToken);
        set({ accessToken, refreshToken });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        writeRefreshCookie(null);
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'satoshi-auth',
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    }
  )
);