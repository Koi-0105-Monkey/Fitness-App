import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';

// ── Types ────────────────────────────────────────────────────────────────────
export interface UpdateProfilePayload {
  fullName?: string;
  nickname?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  goal?: 'lose_weight' | 'gain_weight' | 'muscle_mass' | 'shape_body';
  activityLevel?: 'beginner' | 'intermediate' | 'advanced';
  isSetupComplete?: boolean;
  notificationSettings?: {
    general?: boolean;
    sound?: boolean;
    vibrate?: boolean;
    doNotDisturb?: boolean;
    lockScreen?: boolean;
    reminders?: boolean;
  };
}

// ── User Service ─────────────────────────────────────────────────────────────
export const userService = {
  // Lấy thông tin cá nhân của user đang đăng nhập
  getMe: async () => {
    const { data } = await axiosInstance.get(ENDPOINTS.USER.ME);
    return data;
  },

  // Cập nhật thông tin cá nhân (Bao gồm dữ liệu từ 7-step Setup)
  updateMe: async (payload: UpdateProfilePayload) => {
    const { data } = await axiosInstance.put(ENDPOINTS.USER.ME, payload);
    return data;
  },

  // Xoá tài khoản (Settings)
  deleteMe: async () => {
    const { data } = await axiosInstance.delete(ENDPOINTS.USER.ME);
    return data;
  },

  // Lấy danh sách yêu thích
  getFavorites: async () => {
    const { data } = await axiosInstance.get(ENDPOINTS.USER.FAVORITES);
    return data;
  },

  // Thêm/Xoá yêu thích 1 bài viết/video
  toggleFavorite: async (resourceId: string) => {
    const { data } = await axiosInstance.post(ENDPOINTS.USER.FAVORITES, { resourceId });
    return data;
  },
};
