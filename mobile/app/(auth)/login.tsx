import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
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
    try {
      setLoading(true);
      const res = await authService.login({ emailOrPhone: email.trim(), password });
      await login(res.data.tokens, res.data.user);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đăng nhập thất bại';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Chào mừng trở lại 👋</Text>
        <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Đăng nhập</Text>
          }
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.rowText}>Chưa có tài khoản? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Đăng ký</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 32 },
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
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: COLORS.primary, fontSize: 14 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'center' },
  rowText: { color: COLORS.textSecondary, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});