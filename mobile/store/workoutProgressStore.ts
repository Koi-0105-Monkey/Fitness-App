import { create } from 'zustand';

interface WorkoutProgressState {
  completedExercises: Record<string, boolean>; // key is exerciseId
  markExerciseCompleted: (exerciseId: string) => void;
  resetProgress: () => void;
  isWorkoutCompleted: (allExerciseIds: string[]) => boolean;
}

export const useWorkoutProgressStore = create<WorkoutProgressState>((set, get) => ({
  completedExercises: {},
  markExerciseCompleted: (exerciseId) => 
    set((state) => ({
      completedExercises: { ...state.completedExercises, [exerciseId]: true }
    })),
  resetProgress: () => set({ completedExercises: {} }),
  isWorkoutCompleted: (allExerciseIds) => {
    const { completedExercises } = get();
    if (allExerciseIds.length === 0) return false;
    return allExerciseIds.every(id => completedExercises[id]);
  }
}));
