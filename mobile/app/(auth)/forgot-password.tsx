import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
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
      <View style={styles.container}>
        <Text style={styles.emoji}>📧</Text>
        <Text style={styles.title}>Kiểm tra email của bạn</Text>
        <Text style={styles.subtitle}>
          Chúng tôi đã gửi link đặt lại mật khẩu đến{'\n'}
          <Text style={{ color: COLORS.primary }}>{email}</Text>
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.btnText}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.subtitle}>Nhập email để nhận link đặt lại mật khẩu</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Gửi link đặt lại</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.background, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 24 },
  backText: { color: COLORS.primary, fontSize: 15 },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 32, lineHeight: 22 },
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});