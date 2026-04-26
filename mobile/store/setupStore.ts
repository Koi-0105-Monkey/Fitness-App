import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';

interface SetupData {
  gender?: 'male' | 'female';
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  activityLevel?: string;
  fullName?: string;
  nickname?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}

interface SetupStore {
  data: SetupData;
  updateData: (partial: Partial<SetupData>) => void;
  clearData: () => Promise<void>;
  submitSetup: () => Promise<void>;
  loadSetupData: () => Promise<void>;
}

export const useSetupStore = create<SetupStore>((set, get) => ({
  data: {},

  updateData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
  
  clearData: async () => {
    await SecureStore.deleteItemAsync('setupData');
    await SecureStore.deleteItemAsync('setupComplete');
    set({ data: {} });
  },

  submitSetup: async () => {
    const { data } = get();
    try {
      // Persist setup data to SecureStore as JSON
      await SecureStore.setItemAsync('setupData', JSON.stringify(data));
      // Mark setup as complete locally
      await SecureStore.setItemAsync('setupComplete', 'true');

      // Save to database
      try {
        const apiData: any = { ...data, isSetupComplete: true };

        // 1. Remove empty strings to avoid breaking Mongoose unique sparse index
        if (!apiData.email) delete apiData.email;
        if (!apiData.mobile) delete apiData.mobile;

        // 2. Map field names
        if (apiData.mobile) {
          apiData.mobileNumber = apiData.mobile;
          delete apiData.mobile;
        }



        // 3. Map Goal Enums
        const goalMap: Record<string, string> = {
          'Lose Weight': 'lose_weight',
          'Gain Weight': 'gain_weight',
          'Muscle Mass Gain': 'muscle_mass',
          'Shape Body': 'shape_body'
        };
        if (apiData.goal && goalMap[apiData.goal]) {
          apiData.goal = goalMap[apiData.goal];
        } else {
          delete apiData.goal; // Ignore 'Others' or invalid values to pass validation
        }

        // 4. Map Activity Level Enums
        const levelMap: Record<string, string> = {
          'Beginner': 'beginner',
          'Intermediate': 'intermediate',
          'Advance': 'advanced',
          'Advanced': 'advanced'
        };
        if (apiData.activityLevel && levelMap[apiData.activityLevel]) {
          apiData.activityLevel = levelMap[apiData.activityLevel];
        } else {
          delete apiData.activityLevel;
        }

        await axiosInstance.put(ENDPOINTS.USER.ME, apiData);
        console.log('Setup data saved to database successfully');
      } catch (apiErr: any) {
        console.error('Database save failed, but saved locally:', apiErr?.response?.data || apiErr.message);
        throw apiErr; // re-throw to be caught by UI
      }

    } catch (err) {
      console.error('Failed to save setup data', err);
      throw err;
    }
  },

  loadSetupData: async () => {
    try {
      const raw = await SecureStore.getItemAsync('setupData');
      if (raw) {
        const parsed: SetupData = JSON.parse(raw);
        set({ data: parsed });
      }
    } catch (err) {
      console.error('Failed to load setup data', err);
    }
  },
}));
