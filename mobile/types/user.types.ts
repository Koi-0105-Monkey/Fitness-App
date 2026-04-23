// =============================================
// User Types
// =============================================

export type Gender = 'male' | 'female' | 'other';
export type FitnessGoal = 'lose_weight' | 'gain_weight' | 'muscle_mass' | 'shape_body';
export type ActivityLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  _id: string;
  fullName: string;
  nickname?: string;
  email: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  age?: number;
  weight?: number;         // kg
  height?: number;         // cm
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  avatarUrl?: string;
  isSetupComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  nickname?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  age?: number;
  weight?: number;
  height?: number;
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
}
