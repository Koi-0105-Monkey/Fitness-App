import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function SetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleReset = () => {
    // Navigate to Set Fingerprint or Login depending on flow
    router.push('/(auth)/set-fingerprint' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header section */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={COLORS.yellow} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Set Password</Text>
            <View style={{ width: 24 }} /> {/* Spacer */}
          </View>

          <View style={styles.topSection}>
            <Text style={styles.subtitle}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </View>

          {/* Form section in purple */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.continueBtn} onPress={handleReset}>
              <Text style={styles.continueBtnText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
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
    paddingVertical: 40,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#232323',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'League Spartan',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingHorizontal: 20,
    height: 50,
    fontSize: 15,
    color: '#232323',
  },

  bottomSection: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
    marginTop: 10,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
});
