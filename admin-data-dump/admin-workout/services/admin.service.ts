import axios from 'axios';

// Giả định backend chạy ở cổng 5000
const BASE_URL = 'http://192.168.1.13:5000/api'; // Bạn nên đổi thành IP máy bạn nếu test device thật

const api = axios.create({
  baseURL: BASE_URL,
});

export const adminWorkoutService = {
  createWorkout: async (workoutData: any) => {
    const { data } = await api.post('/workouts', workoutData);
    return data;
  },
  
  seedWorkouts: async () => {
    const { data } = await api.post('/workouts/seed', {});
    return data;
  }
};
