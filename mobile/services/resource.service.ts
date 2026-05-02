import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';
import { Workout } from './workout.service';

export interface ResourceItem {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'article';
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  muscleGroups: string[];
  equipment: string[];
  sport: string[];
  viewsCount: number;
  favoritesCount: number;
}

export const recommendationService = {
  getRecommendations: async (limit?: number): Promise<(Workout & { favoritesCount: number })[]> => {
    const url = limit ? `${ENDPOINTS.WORKOUT.RECOMMENDATIONS}?limit=${limit}` : ENDPOINTS.WORKOUT.RECOMMENDATIONS;
    const { data } = await axiosInstance.get(url);
    return data.data;
  },
};

export const resourceService = {
  getResources: async (params?: {
    muscleGroup?: string;
    equipment?: string;
    sport?: string;
    type?: string;
  }): Promise<ResourceItem[]> => {
    const query = new URLSearchParams();
    if (params?.muscleGroup) query.append('muscleGroup', params.muscleGroup);
    if (params?.equipment)   query.append('equipment', params.equipment);
    if (params?.sport)       query.append('sport', params.sport);
    if (params?.type)        query.append('type', params.type);
    const url = query.toString() ? `${ENDPOINTS.RESOURCE.LIST}?${query}` : ENDPOINTS.RESOURCE.LIST;
    const { data } = await axiosInstance.get(url);
    return data.data;
  },

  getResourceById: async (id: string): Promise<ResourceItem> => {
    const { data } = await axiosInstance.get(ENDPOINTS.RESOURCE.DETAIL(id));
    return data.data;
  },
};
