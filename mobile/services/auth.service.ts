import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';

// ── Types ────────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  fullName: string;
  emailOrPhone: string;
  password?: string;
}

export interface LoginPayload {
  emailOrPhone: string;
  password?: string;
}

export interface SocialLoginPayload {
  provider: 'google' | 'facebook';
  providerId: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

// ── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  register: async (payload: RegisterPayload) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, payload);
    return data; // { success, message, data: { user, tokens } }
  },

  login: async (payload: LoginPayload) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, payload);
    return data;
  },

  socialLogin: async (payload: SocialLoginPayload) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.SOCIAL_LOGIN, payload);
    return data;
  },

  forgotPassword: async (emailOrPhone: string) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { emailOrPhone });
    return data;
  },

  resetPassword: async (emailOrPhone: string, otp: string, newPassword: string) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.RESET_PASSWORD, { emailOrPhone, otp, newPassword });
    return data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data } = await axiosInstance.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword });
    return data;
  },
};