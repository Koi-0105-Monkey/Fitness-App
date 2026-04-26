import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { workoutService, Workout } from '../../../services/workout.service';

export default function SuccessScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (id) {
      workoutService.getWorkoutById(id as string).then(setWorkout).catch(console.error);
    }
  }, [id]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="caret-back" size={20} color="#E2F163" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Animated Celebration GIF - Rendered immediately */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://i.gifer.com/7S79.gif' }} 
            style={styles.trophyAnimation} 
            resizeMode="contain"
          />
        </View>

        {!workout ? (
          <ActivityIndicator size="large" color="#E2F163" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Info Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Congratulations!</Text>
              
              <View style={styles.statsPill}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{workout.duration} Mins</Text>
                  <Ionicons name="time" size={12} color="#212020" />
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{workout.calories} Calories</Text>
                  <Ionicons name="flame" size={12} color="#212020" />
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}</Text>
                  <Ionicons name="walk" size={12} color="#212020" />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.btnPurple}
                onPress={() => router.back()}
              >
                <Text style={styles.btnPurpleText}>Go to the next workout</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.btnYellow}
                onPress={() => router.replace('/(tabs)')}
              >
                <Text style={styles.btnYellowText}>Home</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  header: { padding: 20 },
  
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  
  imageContainer: { height: 350, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  trophyAnimation: { width: 350, height: 350 },
  
  card: { backgroundColor: '#E2F163', width: '100%', paddingVertical: 30, paddingHorizontal: 20, alignItems: 'center', marginBottom: 40 },
  title: { color: '#212020', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  
  statsPill: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 100, paddingVertical: 12, paddingHorizontal: 20, width: '90%', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { color: '#212020', fontSize: 13, fontWeight: '500' },
  
  actions: { width: '100%', paddingHorizontal: 20, gap: 16 },
  btnPurple: { backgroundColor: '#896CFE', width: '100%', paddingVertical: 18, borderRadius: 100, alignItems: 'center' },
  btnPurpleText: { color: 'white', fontSize: 16, fontWeight: '600' },
  btnYellow: { backgroundColor: '#E2F163', width: '100%', paddingVertical: 18, borderRadius: 100, alignItems: 'center' },
  btnYellowText: { color: '#896CFE', fontSize: 16, fontWeight: '600' },
});
