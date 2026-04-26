import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSetupStore } from '../../store/setupStore';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { data, loadSetupData } = useSetupStore();

  useEffect(() => {
    loadSetupData();
  }, []);

  const handleEditAvatar = () => {
    Alert.alert(
      'Edit Avatar',
      'Choose an option',
      [
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera roll permissions are needed!');
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
              const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
              useSetupStore.getState().updateData({ avatarUrl: base64Uri });
              useSetupStore.getState().submitSetup(); // Save to DB
            }
          }
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => {
            useSetupStore.getState().updateData({ avatarUrl: '' });
            useSetupStore.getState().submitSetup(); // Save to DB
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
        }
      ]
    );
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'User')}&background=random&size=200`;
  const avatarSource = data.avatarUrl ? { uri: data.avatarUrl } : { uri: defaultAvatar };

  const profileData = {
    name: data.fullName || 'Madison Smith',
    email: data.email || 'madisons@example.com',
    birthday: 'April 1st',
    weight: data.weight ? `${data.weight} Kg` : '75 Kg',
    age: data.age ? `${data.age}` : '28',
    height: data.height ? `${(data.height / 100).toFixed(2)} M` : '1.65 M',
  };

  const menuItems = [
    { icon: 'person-outline' as const,     title: 'Profile',        onPress: () => router.push('/profile/edit' as any) },
    { icon: 'star-outline' as const,        title: 'Favorite',       onPress: () => {} },
    { icon: 'lock-closed-outline' as const, title: 'Privacy Policy', onPress: () => {} },
    { icon: 'settings-outline' as const,    title: 'Settings',       onPress: () => {} },
    { icon: 'headset-outline' as const,     title: 'Help',           onPress: () => {} },
    {
      icon: 'log-out-outline' as const,
      title: 'Logout',
      onPress: async () => {
        // Clear all local data
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('setupComplete');
        await SecureStore.deleteItemAsync('setupData');
        
        // Clear zustand stores
        useSetupStore.getState().clearData();
        await useAuthStore.getState().logout();
        
        router.replace('/(auth)/login' as any);
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Top Banner */}
        <View style={styles.topBanner}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="caret-back" size={18} color={COLORS.accent} />
            <Text style={styles.headerTitle}>My Profile</Text>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={avatarSource}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditAvatar}>
                <Ionicons name="pencil" size={14} color="#232323" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{profileData.name}</Text>
            <Text style={styles.email}>{profileData.email}</Text>
            <Text style={styles.birthday}>
              <Text style={{ fontWeight: '600' }}>Birthday: </Text>
              {profileData.birthday}
            </Text>
          </View>
        </View>

        {/* Stats Card - floats over the banner */}
        <View style={styles.statsCardContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.weight}</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.age}</Text>
              <Text style={styles.statLabel}>Years Old</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.height}</Text>
              <Text style={styles.statLabel}>Height</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={20} color="white" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="caret-forward" size={14} color={COLORS.accent} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBanner: {
    backgroundColor: COLORS.purple,
    paddingTop: 20,
    paddingBottom: 70,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '300',
    marginBottom: 4,
  },
  birthday: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '300',
  },
  statsCardContainer: {
    alignItems: 'center',
    marginTop: -45,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#896CFE',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'League Spartan',
    fontWeight: '600',
    textAlign: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'League Spartan',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  menuContainer: {
    paddingHorizontal: 28,
    marginTop: 36,
    paddingBottom: 40,
    gap: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'League Spartan',
    flex: 1,
  },
});
