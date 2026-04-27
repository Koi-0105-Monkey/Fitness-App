import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { workoutService, Workout } from '../../../../services/workout.service';
import { COLORS } from '../../../../constants/colors';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const data = await workoutService.getWorkoutById(id);
      setWorkout(data);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.yellow} />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'white' }}>Not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.yellow }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="caret-back" size={18} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Challenge</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search" size={18} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications" size={18} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="person" size={18} color={COLORS.purple} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Featured Card */}
        <View style={styles.featuredCard}>
          <Image
            source={{ uri: workout.imageUrl || 'https://placehold.co/393x200' }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredTitle}>{workout.title}</Text>
            <View style={styles.featuredMeta}>
              <Ionicons name="time-outline" size={11} color="white" />
              <Text style={styles.featuredMetaText}>{workout.duration} Minutes</Text>
              <Ionicons name="flame-outline" size={11} color="white" style={{ marginLeft: 8 }} />
              <Text style={styles.featuredMetaText}>{workout.calories} Kcal</Text>
              <Ionicons name="barbell-outline" size={11} color="white" style={{ marginLeft: 8 }} />
              <Text style={styles.featuredMetaText}>{workout.exercisesCount} Exercises</Text>
            </View>
          </View>
        </View>

        {/* Rounds & Exercises */}
        <View style={styles.roundsContainer}>
          {workout.rounds.map((round, rIdx) => (
            <View key={round._id || rIdx} style={styles.roundBlock}>
              <Text style={styles.roundTitle}>{round.roundName}</Text>
              {round.exercises.map((ex, eIdx) => {
                // Pick icon color cycling through yellow / purple / light green
                const colors = [COLORS.purple, COLORS.yellow, '#B3A0FF'];
                const iconColor = colors[eIdx % colors.length];

                return (
                  <TouchableOpacity
                    key={ex._id || eIdx}
                    style={styles.exCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname: `/workout/exercise/[id]`,
                        params: { id: workout._id, exerciseId: ex._id },
                      })
                    }
                  >
                    {/* Play icon */}
                    <View style={[styles.playCircle, { backgroundColor: iconColor }]}>
                      <View style={styles.playTriangle} />
                    </View>

                    {/* Info */}
                    <View style={styles.exInfo}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      <View style={styles.exDurationRow}>
                        <View style={[styles.durationDot, { backgroundColor: iconColor }]} />
                        <Text style={styles.exDuration}>{ex.duration}</Text>
                      </View>
                    </View>

                    {/* Level badge */}
                    <Text style={[styles.levelBadge, { color: iconColor }]}>
                      {ex.reps || 'Moderate'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 6 },
  headerTitle: {
    flex: 1,
    color: COLORS.purple,
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  headerIcons: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(137,108,254,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Featured
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    marginBottom: 24,
    position: 'relative',
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  featuredInfo: { position: 'absolute', bottom: 14, left: 14 },
  featuredTitle: {
    color: COLORS.yellow,
    fontSize: 17,
    fontFamily: 'Poppins',
    fontWeight: '700',
    marginBottom: 5,
  },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredMetaText: { color: 'white', fontSize: 11, fontFamily: 'League Spartan' },

  // Rounds
  roundsContainer: { paddingHorizontal: 20 },
  roundBlock: { marginBottom: 24 },
  roundTitle: {
    color: COLORS.yellow,
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '700',
    marginBottom: 12,
  },

  // Exercise card
  exCard: {
    backgroundColor: 'white',
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 11,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'white',
    marginLeft: 3,
  },
  exInfo: { flex: 1 },
  exName: {
    color: '#232323',
    fontSize: 15,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginBottom: 2,
  },
  exDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationDot: { width: 7, height: 7, borderRadius: 4 },
  exDuration: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'League Spartan',
  },
  levelBadge: {
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
});
