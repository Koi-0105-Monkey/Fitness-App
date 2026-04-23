// =============================================
// Workout Types
// =============================================

export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutCategory = 'functional_training' | 'cardio' | 'strength' | 'flexibility' | 'hiit';

export interface Exercise {
  _id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;   // seconds
  reps?: number;
  sets?: number;
  restTime?: number;   // seconds
  category: WorkoutCategory;
}

export interface WorkoutRound {
  round: number;
  exercises: Exercise[];
}

export interface Workout {
  _id: string;
  name: string;
  description?: string;
  level: WorkoutLevel;
  category: WorkoutCategory;
  durationMinutes: number;
  caloriesBurned: number;
  thumbnailUrl?: string;
  rounds: WorkoutRound[];
  isFeatured?: boolean;
  isWeeklyChallenge?: boolean;
  createdAt: string;
}

export interface WorkoutLog {
  _id: string;
  userId: string;
  workoutId: string;
  workout?: Workout;
  completedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string;
}

export interface CustomRoutine {
  name: string;
  level: WorkoutLevel;
  exercises: string[];  // exercise IDs
}
