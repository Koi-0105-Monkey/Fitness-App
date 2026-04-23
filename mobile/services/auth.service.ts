import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';

// ── Types ────────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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

  forgotPassword: async (email: string) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
    return data;
  },
};