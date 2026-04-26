import { create } from 'zustand';
import { favoriteService, FavoriteItem } from '../services/favorite.service';

interface FavoriteState {
  favorites: FavoriteItem[];
  isLoading: boolean;
  // Set để tra cứu nhanh O(1) thay vì O(n)
  favoriteIds: Set<string>;

  fetchFavorites: () => Promise<void>;
  toggleFavorite: (workoutId: string) => Promise<boolean>; // trả về trạng thái mới
  isFavorite: (workoutId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,
  favoriteIds: new Set(),

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const items = await favoriteService.getFavorites();
      const ids = new Set(items.map(f => f.workout._id));
      set({ favorites: items, favoriteIds: ids });
    } catch (error) {
      console.log('Error fetching favorites:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (workoutId: string) => {
    // Optimistic update: cập nhật UI ngay trước khi server phản hồi
    const currentlyFav = get().isFavorite(workoutId);
    set(state => {
      const newIds = new Set(state.favoriteIds);
      if (currentlyFav) {
        newIds.delete(workoutId);
      } else {
        newIds.add(workoutId);
      }
      return {
        favoriteIds: newIds,
        favorites: currentlyFav
          ? state.favorites.filter(f => f.workout._id !== workoutId)
          : state.favorites, // List sẽ được refresh lần sau khi fetch
      };
    });

    try {
      const result = await favoriteService.toggleFavorite(workoutId);
      return result.isFavorite;
    } catch (error) {
      // Rollback nếu server lỗi
      set(state => {
        const rollbackIds = new Set(state.favoriteIds);
        if (currentlyFav) {
          rollbackIds.add(workoutId);
        } else {
          rollbackIds.delete(workoutId);
        }
        return { favoriteIds: rollbackIds };
      });
      console.log('Error toggling favorite:', error);
      return currentlyFav; // trả về trạng thái cũ
    }
  },

  isFavorite: (workoutId: string) => get().favoriteIds.has(workoutId),
}));
