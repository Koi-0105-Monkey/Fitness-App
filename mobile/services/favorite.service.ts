import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';
import { Workout } from './workout.service';

export interface FavoriteItem {
  addedAt: string; // ISO date string from server
  workout: Workout;
}

export const favoriteService = {
  // Lấy danh sách favorites từ server
  getFavorites: async (): Promise<FavoriteItem[]> => {
    const { data } = await axiosInstance.get(ENDPOINTS.FAVORITE.LIST);
    return data.data;
  },

  // Toggle: thêm nếu chưa có, xoá nếu đã có
  // Trả về { isFavorite: boolean }
  toggleFavorite: async (workoutId: string): Promise<{ isFavorite: boolean }> => {
    const { data } = await axiosInstance.post(ENDPOINTS.FAVORITE.TOGGLE, { workoutId });
    return data.data;
  },

  // Kiểm tra 1 workout có được favorite không
  checkFavorite: async (workoutId: string): Promise<boolean> => {
    const { data } = await axiosInstance.get(ENDPOINTS.FAVORITE.CHECK(workoutId));
    return data.data.isFavorite;
  },
};
