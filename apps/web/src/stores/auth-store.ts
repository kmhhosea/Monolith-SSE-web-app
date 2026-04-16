'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/types/api';

type AuthState = {
  accessToken: string | null;
  user: User | null;
  setSession: (payload: { accessToken: string; user: User }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: ({ accessToken, user }) => set({ accessToken, user }),
      clearSession: () => set({ accessToken: null, user: null })
    }),
    {
      name: 'sse-auth',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
