import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../../services/auth.service';

export default function LoginScreen() {
  const router = useRouter();
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
        
        router.replace('/(tabs)' as any);
      } else {
        await SecureStore.setItemAsync('setupComplete', 'false');
        router.replace('/(setup)/gender' as any);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback to local mock for dev if API fails (optional, but good for UX if server is offline)
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra API.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#212020' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>💪</Text>
          </View>
          <Text style={styles.title}>Chào mừng trở lại 👋</Text>
          <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => router.push('/(auth)/forgot-password' as any)}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

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
          <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.link}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B3A0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: 'white',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#444',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#B3A0FF',
    fontSize: 14,
  },
  btn: {
    backgroundColor: '#B3A0FF',
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rowText: {
    color: '#888',
    fontSize: 14,
  },
  link: {
    color: '#E2F163',
    fontSize: 14,
    fontWeight: '600',
  },
});