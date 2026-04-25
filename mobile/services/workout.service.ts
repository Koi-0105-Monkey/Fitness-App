import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';

export interface Exercise {
  _id: string;
  name: string;
  duration: string;
  reps: string;
  videoUrl?: string;
  description?: string;
}

export interface Round {
  _id: string;
  roundName: string;
  exercises: Exercise[];
}

export interface Workout {
  _id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  calories: number;
  exercisesCount: number;
  imageUrl: string;
  playsCount: number;
  rounds: Round[];
}

export const workoutService = {
  getWorkouts: async (level?: string): Promise<Workout[]> => {
    const url = level ? `${ENDPOINTS.WORKOUT.LIST}?level=${level}` : ENDPOINTS.WORKOUT.LIST;
    const { data } = await axiosInstance.get(url);
    return data.data; // Server trả về { success, data, message }
  },

  getTrainingOfDay: async (): Promise<Workout> => {
    const { data } = await axiosInstance.get(ENDPOINTS.WORKOUT.TRAINING_OF_DAY);
    return data.data;
  },

  getWorkoutById: async (id: string): Promise<Workout> => {
    const { data } = await axiosInstance.get(ENDPOINTS.WORKOUT.DETAIL(id));
    return data.data;
  },
};
