import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { useSetupStore } from '../../store/setupStore';

export default function FillProfileScreen() {
  const router = useRouter();
  const { data } = useSetupStore();
  const [fullName, setFullName] = useState(data.fullName || '');
  const [nickname, setNickname] = useState(data.nickname || '');
  const [email, setEmail] = useState(data.email || '');
  const [mobile, setMobile] = useState(data.mobile || '');
  const [avatar, setAvatar] = useState<string | null>(data.avatarUrl || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      // Save as base64 data URI so it works seamlessly with backend String field without file upload
      const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Uri);
    }
  };

  const handleStart = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ tên');
      return;
    }

    setLoading(true);
    try {
      // If no avatar is picked, generate a default one based on full name
      const finalAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=200`;

      // Save to setup store
      useSetupStore.getState().updateData({ 
        fullName, 
        nickname,
        email,
        mobile,
        avatarUrl: finalAvatar
      });
      
      // submitSetup() saves all data to SecureStore + marks setupComplete
      await useSetupStore.getState().submitSetup();
      router.replace('/(tabs)' as any);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu thông tin. Thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Fill Your Profile</Text>
          <Text style={styles.subtitle}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>

          <View style={styles.bannerContainer}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#888" />
                </View>
              )}
              <View style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="#232323" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Enter your nickname"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                placeholder="Enter your mobile number"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.startButton, loading && { opacity: 0.6 }]}
            onPress={handleStart}
            disabled={loading}
          >
            <Text style={styles.startButtonText}>{loading ? 'Saving...' : 'Start'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: COLORS.accent, fontSize: 16, fontWeight: '500', marginLeft: 4 },
  title: { color: 'white', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  subtitle: { color: '#888', fontSize: 12, textAlign: 'center', paddingHorizontal: 40, lineHeight: 18, marginBottom: 20 },
  bannerContainer: {
    backgroundColor: COLORS.purple, width: '100%',
    paddingVertical: 30, alignItems: 'center', marginBottom: 30,
  },
  avatarWrapper: { position: 'relative' },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#333', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: 'white',
  },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: COLORS.accent, width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white',
  },
  formContainer: { paddingHorizontal: 30, gap: 20 },
  inputGroup: { gap: 8 },
  label: { color: COLORS.purple, fontWeight: '500', fontSize: 14 },
  input: {
    backgroundColor: 'white', borderRadius: 100, height: 50,
    paddingHorizontal: 20, color: '#232323', fontSize: 16,
  },
  bottomContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingVertical: 30, backgroundColor: COLORS.background, alignItems: 'center',
  },
  startButton: {
    width: 178, height: 44, backgroundColor: COLORS.accent,
    borderRadius: 100, justifyContent: 'center', alignItems: 'center',
  },
  startButtonText: { color: '#232323', fontSize: 18, fontWeight: '700' },
});
