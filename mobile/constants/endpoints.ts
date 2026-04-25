// =============================================
// FITBODY App — API Endpoints
// =============================================

import Constants from 'expo-constants';

let BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api';
let SOCKET_BASE = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';

// Thủ thuật: Tự động lấy IP của máy tính khi chạy qua mạng LAN trên điện thoại (Development)
const debuggerHost = Constants.expoConfig?.hostUri;
if (debuggerHost) {
  const ip = debuggerHost.split(':')[0]; // Lấy phần IP, bỏ cái port của Expo đi
  BASE = `http://${ip}:5000/api`;
  SOCKET_BASE = `http://${ip}:5000`;
}

export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${BASE}/auth/register`,
    LOGIN: `${BASE}/auth/login`,
    SOCIAL_LOGIN: `${BASE}/auth/social-login`,
    REFRESH: `${BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE}/auth/reset-password`,
    CHANGE_PASSWORD: `${BASE}/auth/change-password`,
  },

  // User
  USER: {
    ME: `${BASE}/users/me`,
    AVATAR: `${BASE}/users/avatar`,
    FAVORITES: `${BASE}/users/me/favorites`,
  },

  // Workout
  WORKOUT: {
    LIST: `${BASE}/workouts`,
    DETAIL: (id: string) => `${BASE}/workouts/${id}`,
    TRAINING_OF_DAY: `${BASE}/workouts/training-of-day`,
  },

  // Progress
  PROGRESS: {
    LOGS: `${BASE}/progress/logs`,
    CHARTS: `${BASE}/progress/charts`,
    MEASUREMENT: `${BASE}/progress/measurement`,
  },

  // Nutrition
  NUTRITION: {
    MEALS: `${BASE}/nutrition/meals`,
    MEAL_DETAIL: (id: string) => `${BASE}/nutrition/meals/${id}`,
    MEAL_PLAN: `${BASE}/nutrition/meal-plan`,
  },

  // Community
  COMMUNITY: {
    FORUMS: `${BASE}/community/forums`,
    CHALLENGES: `${BASE}/community/challenges`,
    JOIN_CHALLENGE: (id: string) => `${BASE}/community/challenges/${id}/join`,
  },

  // Resources
  RESOURCES: {
    LIST: `${BASE}/resources`,
    DETAIL: (id: string) => `${BASE}/resources/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: `${BASE}/notifications`,
    READ_ALL: `${BASE}/notifications/read-all`,
  },

  // Search
  SEARCH: `${BASE}/search`,
};

export const SOCKET_URL = SOCKET_BASE;
