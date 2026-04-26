import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useSetupStore } from '../../store/setupStore';

const GOALS = [
  'Lose Weight',
  'Gain Weight',
  'Muscle Mass Gain',
  'Shape Body',
  'Others',
];

export default function GoalScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string>('Lose Weight');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>What Is Your Goal?</Text>
      <Text style={styles.subtitle}>
        Select your main fitness goal to help us tailor a plan that works specifically for you.
      </Text>

      <View style={styles.purpleContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {GOALS.map((goal) => (
            <TouchableOpacity 
              key={goal} 
              style={styles.goalButton}
              onPress={() => setSelectedGoal(goal)}
            >
              <Text style={styles.goalText}>{goal}</Text>
              <View style={styles.radioContainer}>
                {selectedGoal === goal ? (
                  <Ionicons name="checkmark-circle" size={24} color="#232323" />
                ) : (
                  <View style={styles.radioOuter} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => {
          let mappedGoal = '';
          if (selectedGoal === 'Lose Weight') mappedGoal = 'lose_weight';
          else if (selectedGoal === 'Gain Weight') mappedGoal = 'gain_weight';
          else if (selectedGoal === 'Muscle Mass Gain') mappedGoal = 'muscle_mass';
          else if (selectedGoal === 'Shape Body') mappedGoal = 'shape_body';
          
          if (mappedGoal) {
            useSetupStore.getState().updateData({ goal: mappedGoal });
          }
          router.push('/(setup)/activity' as any);
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
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'League Spartan',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
    marginBottom: 40,
  },
  purpleContainer: {
    flex: 1,
    backgroundColor: COLORS.purple,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 40,
    paddingHorizontal: 30,
    marginBottom: 120, // space for continue button
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 40,
  },
  goalButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    color: '#232323',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#232323',
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
