import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, SafeAreaView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { COLORS } from '../../constants/colors';
import { useSetupStore } from '../../store/setupStore';

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    try {
      setLoading(true);
      const res = await authService.register({
        fullName: fullName.trim(),
        emailOrPhone: email.trim(),
        password,
      });
      
      const { user, tokens } = res.data;
      
      // Save tokens
      await SecureStore.setItemAsync('accessToken', tokens.accessToken);
      if (tokens.refreshToken) {
        await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
      }
      
      // Setup not complete yet for new user
      await SecureStore.setItemAsync('setupComplete', 'false');

      // Pre-fill setup store so fill-profile has the data
      const isEmail = email.includes('@');
      useSetupStore.getState().updateData({
        fullName: fullName.trim(),
        email: isEmail ? email.trim() : '',
        mobile: !isEmail ? email.trim() : '',
      });

      // Update Zustand auth store so it knows we are logged in
      useAuthStore.getState().login(tokens, user);

      // Navigate directly to setup
      router.replace('/(setup)/gender' as any);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đăng ký thất bại';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} bounces={false} keyboardShouldPersistTaps="handled">
          {/* Header section */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={COLORS.yellow} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={{ width: 24 }} /> {/* Spacer */}
          </View>

          <View style={styles.topSection}>
            <Text style={styles.title}>Let's Start!</Text>
          </View>

          {/* Form section in purple */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+123 567 89000"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

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
            <Text style={styles.termsText}>
              By continuing, you agree to{'\n'}
              <Text style={styles.termsLink}>Terms of Use</Text> and <Text style={styles.termsLink}>Privacy Policy.</Text>
            </Text>

            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.signupBtnText}>Sign Up</Text>
              }
            </TouchableOpacity>

            <Text style={styles.orText}>or sign up with</Text>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={20} color="#232323" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={20} color="#232323" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="finger-print" size={20} color="#232323" />
              </TouchableOpacity>
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  container: { flexGrow: 1 },
  
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },

  formSection: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 30,
    paddingVertical: 30,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
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
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  termsText: {
    color: '#A0A0A0',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'League Spartan',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.yellow,
    fontWeight: '600',
  },
  signupBtn: {
    backgroundColor: '#232323',
    borderRadius: 100,
    width: 178,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 30,
  },
  btnDisabled: { opacity: 0.6 },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  orText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 20,
    fontFamily: 'League Spartan',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  loginLink: {
    color: COLORS.yellow,
    fontSize: 12,
    fontWeight: '600',
  },
});