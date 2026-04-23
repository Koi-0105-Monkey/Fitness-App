// =============================================
// FITBODY App — API Endpoints
// =============================================

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${BASE}/auth/register`,
    LOGIN: `${BASE}/auth/login`,
    REFRESH: `${BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE}/auth/reset-password`,
  },

  // User
  USER: {
    ME: `${BASE}/users/me`,
    AVATAR: `${BASE}/users/avatar`,
  },

  // Workout
  WORKOUT: {
    LIST: `${BASE}/workouts`,
    DETAIL: (id: string) => `${BASE}/workouts/${id}`,
    WEEKLY_CHALLENGE: `${BASE}/workouts/weekly-challenge`,
    CUSTOM: `${BASE}/workouts/custom`,
    LOG: `${BASE}/workouts/log`,
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

export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';
