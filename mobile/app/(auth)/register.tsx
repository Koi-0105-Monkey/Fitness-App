import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản 🏋️</Text>
        <Text style={styles.subtitle}>Bắt đầu hành trình fitness của bạn</Text>

        {[
          { placeholder: 'Họ và tên', value: fullName, setter: setFullName, autoCapitalize: 'words' as const },
          { placeholder: 'Email', value: email, setter: setEmail, autoCapitalize: 'none' as const, keyboardType: 'email-address' as const },
          { placeholder: 'Mật khẩu', value: password, setter: setPassword, secure: true },
          { placeholder: 'Xác nhận mật khẩu', value: confirm, setter: setConfirm, secure: true },
        ].map((field) => (
          <TextInput
            key={field.placeholder}
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize={field.autoCapitalize ?? 'none'}
            keyboardType={field.keyboardType ?? 'default'}
            secureTextEntry={field.secure ?? false}
            value={field.value}
            onChangeText={field.setter}
          />
        ))}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Đăng ký</Text>
          }
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.rowText}>Đã có tài khoản? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Đăng nhập</Text>
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
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'center' },
  rowText: { color: COLORS.textSecondary, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});