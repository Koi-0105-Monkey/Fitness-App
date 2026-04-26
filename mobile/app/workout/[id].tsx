import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { workoutService, Workout } from '../../services/workout.service';
import { useWorkoutProgressStore } from '../../store/workoutProgressStore';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const completedExercises = useWorkoutProgressStore(state => state.completedExercises);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getWorkoutById(id as string);
      setWorkout(data);
    } catch (error) {
      console.log('Error fetching detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#E2F163" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Không tìm thấy bài tập</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#E2F163' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Image Area */}
      <View style={styles.headerArea}>
        <Image source={{ uri: workout.imageUrl || 'https://placehold.co/393x208' }} style={styles.headerImage} />
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="caret-back" size={20} color="#E2F163" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        {/* Stats Overlay */}
        <View style={styles.statsOverlay}>
          <Text style={styles.title}>{workout.title}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{workout.duration} Minutes</Text>
            <View style={styles.dot} />
            <Text style={styles.statText}>{workout.calories} Kcal</Text>
            <View style={styles.dot} />
            <Text style={[styles.statText, {textTransform: 'capitalize', color: 'white'}]}>{workout.level}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>{workout.description}</Text>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {workout.rounds.map((round, rIndex) => (
            <View key={round._id || rIndex} style={styles.roundBlock}>
            <Text style={styles.roundTitle}>{round.roundName}</Text>
            
            {round.exercises.map((ex, eIndex) => {
              const isCompleted = completedExercises[ex._id as string];

              return (
                <TouchableOpacity 
                  key={ex._id || eIndex} 
                  style={[styles.exerciseCard, isCompleted && { opacity: 0.7 }]}
                  onPress={() => router.push({
                    pathname: `/workout/exercise/[id]`,
                    params: { id: workout._id, exerciseId: ex._id }
                  })}
                >
                  
                  {/* Play/Check Icon */}
                  <View style={[styles.playIconContainer, isCompleted && { backgroundColor: '#4ade80' }]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={24} color="white" />
                    ) : (
                      <View style={styles.playBtn} />
                    )}
                  </View>

                  <View style={styles.exInfo}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    {(ex.duration || ex.videoDuration) ? (
                      <View style={styles.timeRow}>
                        <Ionicons name="time" size={12} color="#B3A0FF" />
                        <Text style={styles.exDuration}>{ex.duration || ex.videoDuration}</Text>
                      </View>
                    ) : null}
                  </View>

                {ex.reps ? (
                  <View style={styles.exRepsContainer}>
                    <Text style={styles.exReps}>{ex.reps}</Text>
                  </View>
                ) : null}

              </TouchableOpacity>
            );
            })}
          </View>
        ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  headerArea: { width: '100%', height: 250, position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { color: 'white', fontWeight: 'bold' },
  
  statsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(33, 32, 32, 0.9)', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { color: '#E2F163', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statText: { color: 'white', fontSize: 13, opacity: 0.9 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'white' },

  scrollArea: { flex: 1 },
  descriptionSection: { padding: 24, paddingBottom: 10 },
  descriptionText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 15, lineHeight: 22 },
  roundBlock: { marginBottom: 30 },
  roundTitle: { color: '#E2F163', fontSize: 20, fontWeight: '600', marginBottom: 16 },
  
  exerciseCard: { backgroundColor: 'white', borderRadius: 100, padding: 8, paddingRight: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  playIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2F163', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  playBtn: { width: 0, height: 0, borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 12, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'white', marginLeft: 4 },
  
  exInfo: { flex: 1 },
  exName: { color: '#232323', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exDuration: { color: '#B3A0FF', fontSize: 13, fontWeight: '600' },
  
  exRepsContainer: { paddingLeft: 8 },
  exReps: { color: '#896CFE', fontSize: 14, fontWeight: '600' },
});
