import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  const { isAuthenticated, isLoading, isSetupComplete, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    /* 
    TẠM THỜI COMMENT ĐỂ TEST UI WORKOUT 
    const inAuthGroup = segments[0] === '(auth)';
    const inSetupGroup = segments[0] === '(setup)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !isSetupComplete && !inSetupGroup) {
      router.replace('/(setup)/gender');
    } else if (isAuthenticated && isSetupComplete && (inAuthGroup || inSetupGroup)) {
      router.replace('/(tabs)');
    }
    */
  }, [isAuthenticated, isLoading, isSetupComplete, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return <Slot />;
}
