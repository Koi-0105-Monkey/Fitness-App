import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { workoutService, Workout } from '../../../services/workout.service';
import { COLORS } from '../../../constants/colors';

const { width } = Dimensions.get('window');

const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function WorkoutScreen() {
  const router = useRouter();
  
  const [activeLevel, setActiveLevel] = useState<string>('beginner');
  const [trainingOfDay, setTrainingOfDay] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeLevel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [todData, listData] = await Promise.all([
        workoutService.getTrainingOfDay(),
        workoutService.getWorkouts(activeLevel),
      ]);
      setTrainingOfDay(todData);
      setWorkouts(listData);
    } catch (error) {
      console.log('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          {LEVELS.map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterPill,
                activeLevel === level ? styles.filterPillActive : styles.filterPillInactive
              ]}
              onPress={() => setActiveLevel(level)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeLevel === level ? styles.filterTextActive : styles.filterTextInactive
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Training of the Day */}
            {trainingOfDay && (
              <TouchableOpacity 
                style={styles.todCard} 
                onPress={() => router.push(`/workout/${trainingOfDay._id}`)}
              >
                <Image source={{ uri: trainingOfDay.imageUrl || 'https://placehold.co/323x198' }} style={styles.todImage} />
                <View style={styles.todTag}>
                  <Text style={styles.todTagText}>Training of the day</Text>
                </View>
                <View style={styles.todInfo}>
                  <Text style={styles.todTitle}>{trainingOfDay.title}</Text>
                  <View style={styles.todStats}>
                    <Text style={styles.todStatText}>{trainingOfDay.duration} Minutes</Text>
                    <View style={styles.dot} />
                    <Text style={styles.todStatText}>{trainingOfDay.calories} Kcal</Text>
                    <View style={styles.dot} />
                    <Text style={styles.todStatText}>{trainingOfDay.exercisesCount} exercises</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Explore Section */}
            <Text style={styles.sectionTitle}>Explore Different Workout Styles</Text>
            <View style={styles.workoutList}>
              {workouts.map(item => (
                <TouchableOpacity 
                  key={item._id} 
                  style={styles.workoutCard}
                  onPress={() => router.push(`/workout/${item._id}`)}
                >
                  <View style={styles.workoutCardInfo}>
                    <Text style={styles.workoutCardTitle}>{item.title}</Text>
                    <View style={styles.todStats}>
                      <Text style={styles.workoutCardStat}>{item.duration} Minutes</Text>
                      <View style={styles.dotDark} />
                      <Text style={styles.workoutCardStat}>{item.exercisesCount} exercises</Text>
                      <View style={styles.dotDark} />
                      <Text style={styles.workoutCardStat}>{item.calories} Kcal</Text>
                    </View>
                  </View>
                  <Image source={{ uri: item.imageUrl || 'https://placehold.co/147x110' }} style={styles.workoutCardImage} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 20 },
  headerTitle: { color: '#896CFE', fontSize: 24, fontWeight: '700', textTransform: 'capitalize' },
  
  filterContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  filterPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 100 },
  filterPillActive: { backgroundColor: '#E2F163' },
  filterPillInactive: { backgroundColor: 'white' },
  filterText: { fontSize: 15, fontWeight: '500' },
  filterTextActive: { color: '#232323' },
  filterTextInactive: { color: '#896CFE' },

  todCard: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 32, position: 'relative' },
  todImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  todTag: { position: 'absolute', top: 16, right: 16, backgroundColor: '#E2F163', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  todTagText: { color: '#212020', fontSize: 12, fontWeight: '600' },
  todInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(33, 32, 32, 0.9)', padding: 12, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  todTitle: { color: '#E2F163', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  todStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todStatText: { color: 'white', fontSize: 12, opacity: 0.8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'white' },

  sectionTitle: { color: 'white', fontSize: 14, opacity: 0.7, marginBottom: 16 },
  workoutList: { gap: 16 },
  workoutCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workoutCardInfo: { flex: 1, paddingRight: 12 },
  workoutCardTitle: { color: '#212020', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  workoutCardStat: { color: '#212020', fontSize: 12, opacity: 0.6 },
  dotDark: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#212020', opacity: 0.5 },
  workoutCardImage: { width: 100, height: 80, borderRadius: 12, resizeMode: 'cover' },
});
