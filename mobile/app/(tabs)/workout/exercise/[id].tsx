import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { workoutService, Workout, Exercise } from '../../../../services/workout.service';
import { COLORS } from '../../../../constants/colors';

const { width, height } = Dimensions.get('window');
const MEDIA_WIDTH = width - 70;
const MEDIA_HEIGHT = MEDIA_WIDTH * 1.42; // ~2:3 ratio

export default function ExerciseDetailScreen() {
  const { id, exerciseId } = useLocalSearchParams<{ id: string; exerciseId: string }>();
  const router = useRouter();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);

  const player = useVideoPlayer({ uri: exercise?.videoUrl || '' });

  useEffect(() => {
    if (player && exercise?.videoUrl) {
      player.loop = true;
    }
  }, [player, exercise?.videoUrl]);

  useEffect(() => {
    if (id && exerciseId) fetchData();
  }, [id, exerciseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getWorkoutById(id);
      setWorkout(data);

      let foundEx: Exercise | null = null;
      for (const round of data.rounds) {
        const match = round.exercises.find((e) => e._id === exerciseId);
        if (match) { foundEx = match; break; }
      }
      setExercise(foundEx);
    } catch (error) {
      console.log('Error fetching exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (player && exercise?.videoUrl) {
      if (playing) { player.pause(); } else { player.play(); }
      setPlaying(!playing);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.yellow} />
      </View>
    );
  }

  if (!exercise || !workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'white', marginBottom: 16 }}>Exercise not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.yellow }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback thumbnail
  const fallbackImage = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="caret-back" size={18} color={COLORS.yellow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search" size={20} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications" size={20} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="person" size={20} color={COLORS.purple} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── PURPLE BACKGROUND SECTION ── */}
      <View style={styles.purpleSection}>
        {/* Media Card */}
        <View style={styles.mediaCard}>
          {exercise.videoUrl ? (
            <VideoView
              player={player}
              style={styles.mediaInner}
              contentFit="cover"
            />
          ) : (
            <Image
              source={{ uri: fallbackImage }}
              style={styles.mediaInner}
              resizeMode="cover"
            />
          )}

          {/* Play Button - Only show if not playing */}
          {!playing && (
            <TouchableOpacity style={styles.playCircle} onPress={handlePlay} activeOpacity={0.8}>
              <View style={styles.playTriangle} />
            </TouchableOpacity>
          )}

          {/* Optional: Add a transparent overlay to toggle play/pause when tapping the video itself */}
          {playing && (
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              onPress={handlePlay} 
              activeOpacity={1}
            />
          )}

          {/* Star bookmark */}
          <TouchableOpacity style={styles.starBtn} onPress={() => setSaved(!saved)}>
            <Ionicons
              name={saved ? 'star' : 'star-outline'}
              size={22}
              color={saved ? COLORS.yellow : 'white'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── INFO CARD ── */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          {/* Title */}
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          {/* Description */}
          <Text style={styles.exerciseDesc} numberOfLines={3}>
            {exercise.description ||
              'Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Sed Cursus Libero Eget.'}
          </Text>

          {/* Stats pill */}
          <View style={styles.statsPill}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={14} color="#232323" />
              <Text style={styles.statText}>{exercise.duration}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame" size={14} color="#232323" />
              <Text style={styles.statText}>{exercise.reps}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="accessibility" size={14} color="#232323" />
              <Text style={styles.statText}>{workout.level}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#212020',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#212020',
    zIndex: 10,
  },
  backBtn: {
    padding: 4,
    marginRight: 6,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.purple,
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },

  // Purple BG section
  purpleSection: {
    backgroundColor: '#B3A0FF',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },

  // Media card
  mediaCard: {
    width: MEDIA_WIDTH,
    height: MEDIA_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'black',
    position: 'relative',
  },
  mediaInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  // Play button
  playCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -78,
    marginLeft: -78,
    width: 157,
    height: 157,
    borderRadius: 78.5,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.92,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 28,
    borderBottomWidth: 28,
    borderLeftWidth: 46,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'white',
    marginLeft: 8,
  },

  // Star
  starBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
  },

  // Info section
  infoSection: {
    flex: 1,
    backgroundColor: '#212020',
    alignItems: 'center',
    paddingTop: 24,
  },

  // Info Card (yellow)
  infoCard: {
    width: width - 70,
    backgroundColor: COLORS.yellow,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  exerciseName: {
    color: '#212020',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
  },
  exerciseDesc: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },

  // Stats pill (white)
  statsPill: {
    backgroundColor: 'white',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#232323',
    fontSize: 13,
    fontFamily: 'League Spartan',
    fontWeight: '300',
    textTransform: 'capitalize',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 4,
  },
});
