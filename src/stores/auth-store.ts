'use client';

import { create } from 'zustand';
import type { User, AuthResponse } from '@/types/auth';
import { saveTokens, clearTokens, saveUser, getUser, getAccessToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (data: AuthResponse) => {
    saveTokens(data.access_token, data.refresh_token);
    saveUser(data.user);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const user = getUser();
    const hasToken = !!getAccessToken();
    set({
      user: hasToken ? user : null,
      isAuthenticated: hasToken && !!user,
      isLoading: false,
    });
  },
}));
