import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/auth.service';
import { COLORS } from '../../constants/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Có lỗi xảy ra';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { paddingHorizontal: 30, justifyContent: 'center' }]}>
          <Text style={styles.emoji}>📧</Text>
          <Text style={[styles.title, { textAlign: 'center' }]}>Kiểm tra email của bạn</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi link đặt lại mật khẩu đến{'\n'}
            <Text style={{ color: COLORS.yellow }}>{email}</Text>
          </Text>
          <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.continueBtnText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={COLORS.yellow} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.topSection}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </View>

          
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enter your email address</Text>
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
          </View>

          
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.continueBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.continueBtnText}>Continue</Text>
              }
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
    marginBottom: 0,
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
  btnDisabled: { opacity: 0.6 },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
});