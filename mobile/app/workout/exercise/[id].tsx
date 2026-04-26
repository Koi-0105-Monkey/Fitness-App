import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { workoutService, Workout, Exercise } from '../../../services/workout.service';
import { useWorkoutProgressStore } from '../../../store/workoutProgressStore';

export default function ExerciseDetailScreen() {
  const { id, exerciseId } = useLocalSearchParams();
  const router = useRouter();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Workout state
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimed, setIsTimed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const markExerciseCompleted = useWorkoutProgressStore(state => state.markExerciseCompleted);
  const isWorkoutCompleted = useWorkoutProgressStore(state => state.isWorkoutCompleted);

  // Initialize player
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
    return () => clearTimer();
  }, [id, exerciseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getWorkoutById(id as string);
      setWorkout(data);

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

  const getSeconds = (durationStr?: string) => {
    if (!durationStr) return 0;
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return parseInt(durationStr) || 0;
  };

  const handleStart = () => {
    setIsStarted(true);
    const secs = getSeconds(exercise?.duration);
    if (secs > 0 && (!exercise?.reps || exercise?.reps.toLowerCase().includes('x') === false)) {
      setIsTimed(true);
      setTimeLeft(secs);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            // Đừng gọi handleComplete ở đây
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsTimed(false);
    }
  };

  // Tự động hoàn thành khi đếm ngược về 0
  useEffect(() => {
    if (isTimed && isStarted && timeLeft === 0) {
      handleComplete();
    }
  }, [timeLeft, isTimed, isStarted]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleComplete = () => {
    clearTimer();
    markExerciseCompleted(exerciseId as string);
    
    // Check if the entire workout is done
    if (workout) {
      const allExIds: string[] = [];
      workout.rounds.forEach(r => r.exercises.forEach(e => allExIds.push(e._id)));
      
      if (isWorkoutCompleted(allExIds)) {
        router.replace(`/workout/success/${workout._id}`);
        return;
      }
    }
    
    Alert.alert('Hoàn thành!', 'Bạn đã hoàn thành bài tập này.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleGiveUp = () => {
    Alert.alert('Từ bỏ?', 'Bạn có chắc chắn muốn dừng bài tập này không?', [
      { text: 'Tiếp tục tập', style: 'cancel' },
      { text: 'Bỏ cuộc', style: 'destructive', onPress: () => {
        clearTimer();
        router.back();
      }}
    ]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color="#E2F163" />
    </SafeAreaView>
  );

  if (!exercise || !workout) return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: 'white' }}>Không tìm thấy dữ liệu</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: '#E2F163' }}>Quay lại</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => { clearTimer(); router.back(); }}>
            <Ionicons name="caret-back" size={20} color="#E2F163" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Ionicons name="search" size={22} color="#896CFE" /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="notifications" size={22} color="#896CFE" /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile' as any)}>
            <Ionicons name="person" size={22} color="#896CFE" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Purple Media Section */}
        <View style={styles.purpleSection}>
          <View style={styles.mediaContainer}>
            {exercise.videoUrl ? (
              <VideoView
                player={player}
                style={styles.mediaFrame}
                contentFit={exercise.fitMode || 'contain'}
              />
            ) : (
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' }} 
                style={styles.mediaFrame} 
              />
            )}
            
            <View style={styles.starIconContainer}>
              <Ionicons name="star" size={24} color="#E2F163" />
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.yellowCard}>
            <Text style={styles.yellowTitle}>{exercise.name}</Text>
            <Text style={styles.yellowDesc}>
              {exercise.description || 'Hoàn thành bài tập theo đúng hướng dẫn để đạt hiệu quả tốt nhất.'}
            </Text>
            
            <View style={styles.statsPill}>
              {(exercise.duration || exercise.videoDuration) ? (
                <View style={styles.statItem}>
                  <Ionicons name="time" size={14} color="#212020" />
                  <Text style={styles.statText}>{exercise.duration || exercise.videoDuration}</Text>
                </View>
              ) : null}
              {exercise.reps ? (
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={14} color="#212020" />
                  <Text style={styles.statText}>{exercise.reps}</Text>
                </View>
              ) : null}
              <View style={styles.statItem}>
                <Ionicons name="walk" size={14} color="#212020" />
                <Text style={styles.statText}>{workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}</Text>
              </View>
            </View>
          </View>

          {/* Action Area */}
          <View style={styles.actionArea}>
            {!isStarted ? (
              <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                <Text style={styles.startBtnText}>Start Workout</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeArea}>
                {isTimed ? (
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                ) : null}

                <View style={styles.activeBtns}>
                  <TouchableOpacity style={styles.giveUpBtn} onPress={handleGiveUp}>
                    <Text style={styles.giveUpBtnText}>Give Up</Text>
                  </TouchableOpacity>
                  
                  {!isTimed || timeLeft <= 0 ? (
                    <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                      <Text style={styles.completeBtnText}>Complete</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  scrollContent: { paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#212020' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  headerIcons: { flexDirection: 'row', gap: 16 },

  purpleSection: { backgroundColor: '#B3A0FF', padding: 20, paddingBottom: 40 },
  mediaContainer: { width: '100%', aspectRatio: 9/16, position: 'relative', borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  mediaFrame: { width: '100%', height: '100%' },
  
  starIconContainer: { position: 'absolute', top: 16, right: 16 },

  infoSection: { backgroundColor: '#212020', padding: 20, marginTop: -20 },
  yellowCard: { backgroundColor: '#E2F163', borderRadius: 24, padding: 24, alignItems: 'center', marginTop: 40 },
  yellowTitle: { color: '#212020', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  yellowDesc: { color: '#212020', fontSize: 14, textAlign: 'center', opacity: 0.8, marginBottom: 20, lineHeight: 20 },
  
  statsPill: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 100, paddingVertical: 12, paddingHorizontal: 20, width: '100%', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#212020', fontSize: 12, fontWeight: '600' },

  actionArea: { marginTop: 40, alignItems: 'center' },
  startBtn: { backgroundColor: '#896CFE', width: '100%', paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  startBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
  
  activeArea: { width: '100%', alignItems: 'center' },
  timerText: { color: '#E2F163', fontSize: 48, fontWeight: 'bold', marginBottom: 20 },
  activeBtns: { flexDirection: 'row', width: '100%', gap: 16 },
  giveUpBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#896CFE', paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  giveUpBtnText: { color: '#896CFE', fontSize: 16, fontWeight: '600' },
  completeBtn: { flex: 1, backgroundColor: '#896CFE', paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  completeBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
