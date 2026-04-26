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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      // Real API call
      const res = await authService.login({ emailOrPhone: email.trim(), password });
      
      const { user, tokens } = res.data;
      
      await SecureStore.setItemAsync('accessToken', tokens.accessToken);
      if (tokens.refreshToken) {
        await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
      }

      // Check if setup was already done from the DB user object
      if (user.isSetupComplete) {
        await SecureStore.setItemAsync('setupComplete', 'true');
        // Save fetched data to setup store locally for profile usage
        const userDataToSave = {
          fullName: user.fullName,
          nickname: user.nickname,
          email: user.email,
          mobile: user.mobileNumber,
          gender: user.gender,
          age: user.age,
          weight: user.weight,
          height: user.height,
          goal: user.goal,
          activityLevel: user.activityLevel
        };
        await SecureStore.setItemAsync('setupData', JSON.stringify(userDataToSave));
        
        // Also update zustand
        await login(tokens, user);
        router.replace('/(tabs)' as any);
      } else {
        await SecureStore.setItemAsync('setupComplete', 'false');
        await login(tokens, user);
        router.replace('/(setup)/gender' as any);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra API.'
      );
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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={COLORS.yellow} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Log In</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.topSection}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Log in to track your workout progress, set new goals, and achieve your dream body.
            </Text>
          </View>

          
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username or email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
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

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/(auth)/forgot-password' as any)}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginBtnText}>Log In</Text>
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

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: 16,
    fontFamily: 'Poppins',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -5,
  },
  forgotText: {
    color: '#232323',
    fontSize: 12,
    fontWeight: '500',
  },

  bottomSection: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loginBtn: {
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
  loginBtnText: {
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
    marginBottom: 40,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  signupLink: {
    color: COLORS.yellow,
    fontSize: 12,
    fontWeight: '600',
  },
});