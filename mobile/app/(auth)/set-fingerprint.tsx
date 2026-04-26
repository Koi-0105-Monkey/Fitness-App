import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function SetFingerprintScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/(auth)/login' as any);
  };

  const handleSkip = () => {
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header section */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.yellow} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Your Fingerprint</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>

        <View style={styles.topSection}>
          <Text style={styles.subtitle}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </View>

        {/* Fingerprint section in purple */}
        <View style={styles.formSection}>
          <Ionicons name="finger-print-outline" size={150} color="#FFFFFF" style={styles.fingerprintIcon} />
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 40,
  },
  backButton: { padding: 4 },
  headerTitle: {
    color: COLORS.yellow,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  
  topSection: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'League Spartan',
  },

  formSection: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 30,
    paddingVertical: 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  bottomSection: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: 15,
  },
  skipBtn: {
    backgroundColor: 'transparent',
    borderRadius: 100,
    width: 178,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  skipBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  continueBtn: {
    backgroundColor: '#232323',
    borderRadius: 100,
    width: 178,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
});
