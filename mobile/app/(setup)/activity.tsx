import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useSetupStore } from '../../store/setupStore';
import { useAuthStore } from '../../store/authStore';

type ActivityLevel = 'Beginner' | 'Intermediate' | 'Advance';

const LEVELS: ActivityLevel[] = ['Beginner', 'Intermediate', 'Advance'];

export default function ActivityScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel>('Advance');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Physical Activity Level</Text>
      <Text style={styles.subtitle}>
        Choose your current activity level to help us calculate your daily calorie and nutrition needs accurately.
      </Text>

      <View style={styles.levelsContainer}>
        {LEVELS.map((level) => {
          const isSelected = selectedLevel === level;
          return (
            <TouchableOpacity 
              key={level} 
              style={[styles.levelButton, isSelected && styles.levelButtonSelected]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text style={[styles.levelText, isSelected && styles.levelTextSelected]}>
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={async () => {
          let mappedLevel = 'advanced';
          if (selectedLevel === 'Beginner') mappedLevel = 'beginner';
          if (selectedLevel === 'Intermediate') mappedLevel = 'intermediate';
          
          useSetupStore.getState().updateData({ activityLevel: mappedLevel });
          
          try {
            // FINAL STEP: Submit everything to server and mark setup complete
            await useSetupStore.getState().submitSetup();
            useAuthStore.getState().completeSetup();
            router.replace('/(tabs)' as any);
          } catch (error) {
            Alert.alert('Error', 'Failed to save setup data');
          }
        }}
      >
        <Text style={styles.continueButtonText}>Finish</Text>
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
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'League Spartan',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
    marginBottom: 60,
  },
  levelsContainer: {
    paddingHorizontal: 30,
    gap: 25,
  },
  levelButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
  },
  levelButtonSelected: {
    backgroundColor: COLORS.accent,
  },
  levelText: {
    color: COLORS.purple,
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  levelTextSelected: {
    color: '#232323',
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
