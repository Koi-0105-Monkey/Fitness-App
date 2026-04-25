import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { workoutService, Workout, Exercise } from '../../../services/workout.service';

export default function ExerciseDetailScreen() {
  const { id, exerciseId } = useLocalSearchParams();
  const router = useRouter();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo player
  const player = useVideoPlayer({ uri: exercise?.videoUrl || '' });

  useEffect(() => {
    if (player) {
      player.loop = true;
      player.play();
    }
  }, [player, exercise?.videoUrl]);

  useEffect(() => {
    if (id && exerciseId) {
      fetchData();
    }
  }, [id, exerciseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getWorkoutById(id as string);
      setWorkout(data);

      // Tìm bài tập cụ thể
      let foundEx: Exercise | null = null;
      for (const round of data.rounds) {
        const match = round.exercises.find(e => e._id === exerciseId);
        if (match) {
          foundEx = match;
          break;
        }
      }
      setExercise(foundEx);
    } catch (error) {
      console.log('Error fetching exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#E2F163" /></View>
  );

  if (!exercise || !workout) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: 'white' }}>Không tìm thấy dữ liệu</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: '#E2F163' }}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Khung Video/Hình ảnh */}
      <View style={styles.mediaContainer}>
        {exercise.videoUrl ? (
          <VideoView
            player={player}
            style={styles.mediaFrame}
            contentFit="cover"
          />
        ) : (
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' }} 
            style={styles.mediaFrame} 
          />
        )}
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin bài tập */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.description}>
          {exercise.description || 'Không có mô tả cho động tác này.'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{exercise.duration}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{exercise.reps}</Text>
          </View>
          <View style={styles.statBoxLevel}>
            <Text style={styles.statLevelText}>{workout.level}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  
  mediaContainer: { width: '100%', height: '60%', position: 'relative', padding: 20, paddingTop: 60, alignItems: 'center' },
  mediaFrame: { width: '100%', height: '100%', borderRadius: 24, resizeMode: 'cover', borderWidth: 2, borderColor: '#B3A0FF' },
  
  backBtn: { position: 'absolute', top: 50, left: 30, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  backBtnText: { color: 'white', fontWeight: 'bold' },

  bigPlayBtn: { 
    position: 'absolute', top: '50%', left: '50%', 
    transform: [{ translateX: -40 }, { translateY: -40 }],
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#896CFE',
    justifyContent: 'center', alignItems: 'center'
  },
  playIcon: { width: 0, height: 0, borderTopWidth: 15, borderBottomWidth: 15, borderLeftWidth: 25, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'white', marginLeft: 5 },

  infoContainer: { flex: 1, padding: 24, alignItems: 'center' },
  title: { color: '#E2F163', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  description: { color: 'white', fontSize: 14, textAlign: 'center', opacity: 0.8, marginBottom: 24, lineHeight: 22 },

  statsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  statBox: { backgroundColor: '#B3A0FF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  statValue: { color: '#212020', fontSize: 14, fontWeight: '600' },
  
  statBoxLevel: { backgroundColor: '#E2F163', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  statLevelText: { color: '#212020', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
});
