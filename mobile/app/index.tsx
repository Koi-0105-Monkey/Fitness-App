import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

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
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate logo in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // After 2.5 seconds, decide where to go
    const timer = setTimeout(async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const setupDone = await SecureStore.getItemAsync('setupComplete');

        if (!token) {
          router.replace('/(auth)/login' as any);
        } else if (setupDone !== 'true') {
          router.replace('/(setup)/gender' as any);
        } else {
          router.replace('/(tabs)' as any);
        }
      } catch {
        router.replace('/(auth)/login' as any);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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