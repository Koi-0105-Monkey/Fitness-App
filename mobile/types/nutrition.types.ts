// =============================================
// Nutrition Types
// =============================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten_free' | 'keto' | 'paleo' | 'none';
export type CaloricGoal = 'less_1500' | '1500_2000' | 'more_2000' | 'unknown';
export type CookingTime = 'less_15' | '15_30' | 'more_30';
export type FoodAllergy = 'nuts' | 'dairy' | 'shellfish' | 'eggs' | 'none';

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Meal {
  _id: string;
  name: string;
  type: MealType;
  thumbnailUrl?: string;
  durationMinutes: number;
  calories: number;
  ingredients: Ingredient[];
  preparation: string;
  isRecommended?: boolean;
  createdAt: string;
}

export interface MealPlanPreferences {
  dietaryPreference: DietaryPreference;
  caloricGoal: CaloricGoal;
  allergies: FoodAllergy[];
  cookingTime: CookingTime;
  mealTypes: MealType[];
  servings: number;
}

export interface MealPlan {
  _id: string;
  userId: string;
  preferences: MealPlanPreferences;
  meals: {
    type: MealType;
    meal: Meal;
  }[];
  createdAt: string;
}
