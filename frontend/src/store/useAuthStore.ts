import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserState {
  id: number;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string | null;
  currency: string;
}

interface AuthStore {
  user: UserState | null;
  accessToken: string | null;
  refreshToken: string | null;
  theme: 'light' | 'dark';
  setAuth: (user: UserState, accessToken: string, refreshToken: string) => void;
  updateUser: (updates: Partial<UserState>) => void;
  logout: () => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      theme: 'dark', // Modern default
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'light' ? 'dark' : 'light';
          return { theme: nextTheme };
        }),
    }),
    {
      name: 'finance-tracker-auth',
    }
  )
);
export default useAuthStore;
