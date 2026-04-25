import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useSetupStore } from '../../store/setupStore';

export default function GenderScreen() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>What's Your Gender</Text>

      <View style={styles.purpleBanner}>
        <Text style={styles.bannerText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </View>

      <View style={styles.selectionContainer}>
        <View style={styles.genderOption}>
          <TouchableOpacity 
            style={[styles.circle, selectedGender === 'male' && { backgroundColor: '#5C9CE6', borderColor: '#5C9CE6' }]}
            onPress={() => setSelectedGender('male')}
          >
            <Ionicons 
              name="male" 
              size={50} 
              color="white" 
            />
          </TouchableOpacity>
          <Text style={styles.genderText}>Male</Text>
        </View>

        <View style={styles.genderOption}>
          <TouchableOpacity 
            style={[styles.circle, selectedGender === 'female' && { backgroundColor: '#F06292', borderColor: '#F06292' }]}
            onPress={() => setSelectedGender('female')}
          >
            <Ionicons 
              name="female" 
              size={50} 
              color="white" 
            />
          </TouchableOpacity>
          <Text style={styles.genderText}>Female</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => {
          useSetupStore.getState().updateData({ gender: selectedGender });
          router.push('/(setup)/age' as any);
        }}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: COLORS.accent,
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  purpleBanner: {
    width: '100%',
    backgroundColor: COLORS.purple,
    paddingVertical: 20,
    paddingHorizontal: 35,
    marginBottom: 60,
  },
  bannerText: {
    color: '#232323',
    fontSize: 14,
    fontFamily: 'League Spartan',
    fontWeight: '300',
    lineHeight: 18,
    textAlign: 'center',
  },
  selectionContainer: {
    alignItems: 'center',
    gap: 40,
  },
  genderOption: {
    alignItems: 'center',
    gap: 15,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },

  genderText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  continueButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 178,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
});
