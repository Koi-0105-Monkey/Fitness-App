import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useSetupStore } from '../store/setupStore';

/**
 * This IS the splash screen.
 * It renders the FITBODY logo for 2.5 seconds, then navigates based on auth state.
 *
 * Flow:
 *   No token     → /(auth)/login
 *   Token exists, no setup → /(setup)/gender
 *   Token + setup done     → /(tabs)
 */
export default function SplashIndex() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isSetupComplete, isLoading } = useAuthStore();
  const { loadSetupData } = useSetupStore();
  const [isMounted, setIsMounted] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    setIsMounted(true);
    // Animate logo in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // After animation, verify session
    const timer = setTimeout(async () => {
      try {
        await loadSetupData(); // Load draft data if any
        await checkAuth();     // Verify token with server
      } catch (error) {
        console.error('Splash Auth Check Error:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Listen to auth state changes to navigate
  useEffect(() => {
    if (isLoading || !isMounted) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!isSetupComplete) {
      router.replace('/(setup)');
    } else {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated, isSetupComplete, isMounted]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>💪</Text>
        </View>
        <Text style={styles.appName}>FITBODY</Text>
        <Text style={styles.tagline}>Your fitness journey starts here</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#B3A0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconEmoji: {
    fontSize: 48,
  },
  appName: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 4,
  },
  tagline: {
    color: '#B3A0FF',
    fontSize: 14,
    opacity: 0.8,
  },
});
