import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useFonts } from 'expo-font';
import { 
  Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold 
} from '@expo-google-fonts/poppins';
import { 
  LeagueSpartan_300Light, LeagueSpartan_400Regular, LeagueSpartan_500Medium, LeagueSpartan_600SemiBold, LeagueSpartan_700Bold 
} from '@expo-google-fonts/league-spartan';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    Poppins_500: Poppins_500Medium,
    Poppins_600: Poppins_600SemiBold,
    Poppins_700: Poppins_700Bold,
    'League Spartan': LeagueSpartan_400Regular,
    'League Spartan_300': LeagueSpartan_300Light,
    'League Spartan_500': LeagueSpartan_500Medium,
    'League Spartan_600': LeagueSpartan_600SemiBold,
    'League Spartan_700': LeagueSpartan_700Bold,
  });

  const { isAuthenticated, isLoading, isSetupComplete, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Do not redirect if we are at the splash screen (index.tsx)
    // The splash screen handles its own timed navigation
    const isSplash = !segments[0];
    if (isSplash) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSetupGroup = segments[0] === '(setup)';

    if (!isAuthenticated && !inAuthGroup) {
      // Chưa đăng nhập → về Login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !isSetupComplete && !inSetupGroup) {
      // Đã đăng nhập nhưng chưa setup profile 7 bước
      router.replace('/(setup)/welcome' as any);
    } else if (isAuthenticated && isSetupComplete && (inAuthGroup || inSetupGroup)) {
      // Đã xong hết → vào app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, isSetupComplete, segments]);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.yellow || '#fff'} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(setup)" />
        <Stack.Screen name="recommendations" />
        <Stack.Screen name="resources/[id]" />
        <Stack.Screen name="workout/success/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
