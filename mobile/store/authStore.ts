import { create } from 'zustand';
import { User } from '../types/user.types';
import { AuthTokens } from '../types/api.types';
import { setItem, removeItem, getItem } from '../utils/storage';
import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSetupComplete: boolean;

  // Actions
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isSetupComplete: false,

  login: async (tokens, user) => {
    await setItem('accessToken', tokens.accessToken);
    await setItem('refreshToken', tokens.refreshToken);
    set({
      user,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      isSetupComplete: user.isSetupComplete,
    });
  },

  logout: async () => {
    await removeItem('accessToken');
    await removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isSetupComplete: false,
    });
  },

  updateUser: (updatedFields) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...updatedFields } });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await getItem('accessToken');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const { data } = await axiosInstance.get(ENDPOINTS.USER.ME);
      set({
        user: data.data,
        accessToken: token,
        isAuthenticated: true,
        isSetupComplete: data.data.isSetupComplete,
      });
    } catch {
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
