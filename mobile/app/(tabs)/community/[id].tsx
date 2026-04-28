import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { workoutService, Workout } from '../../../services/workout.service';
import { COLORS } from '../../../constants/colors';

const { width, height } = Dimensions.get('window');

// Fallback local images when no imageUrl from API
const LOCAL_IMAGES = [
  require('../../../assets/beautiful-young-sporty-woman-training-workout-gym 4.png'),
  require('../../../assets/woman-helping-man-gym (1) 2.png'),
  require('../../../assets/woman-helping-man-gym (1) 3.png'),
  require('../../../assets/woman-helping-man-gym (1) 4.png'),
  require('../../../assets/woman-helping-man-gym (1) 5.png'),
  require('../../../assets/woman-helping-man-gym (1) 6.png'),
];

function getLocalImage(id: string) {
  const idx = parseInt(id?.slice(-2) || '0', 16) % LOCAL_IMAGES.length;
  return LOCAL_IMAGES[idx];
}

export default function ChallengeIntroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const data = await workoutService.getWorkoutById(id);
      setWorkout(data);
    } catch (e) {
      console.log('Error loading challenge:', e);
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
        <Text style={{ color: 'white' }}>Challenge not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.yellow }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const challengeName = `${workout.title} Challenge`;
  const imgSource = workout.imageUrl ? { uri: workout.imageUrl } : getLocalImage(id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── FULL SCREEN BACKGROUND IMAGE (slightly rotated like design) ── */}
      <Image
        source={imgSource}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* Dark overlay */}
      <View style={styles.bgOverlay} />

      {/* ── TOP HEADER ── */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="caret-back" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => setSaved(!saved)}>
            <Ionicons
              name={saved ? 'star' : 'star-outline'}
              size={22}
              color={saved ? COLORS.yellow : 'white'}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="person-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── PURPLE INFO BANNER ── */}
      <View style={styles.infoBanner}>
        {/* Running icon (yellow) */}
        <View style={styles.runIconWrap}>
          <Ionicons name="bicycle" size={26} color={COLORS.yellow} />
        </View>

        {/* Title */}
        <Text style={styles.challengeTitle}>{challengeName}</Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {workout.description ||
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'}
        </Text>

        {/* Start Now Button — glassmorphism pill */}
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/community/challenge/${id}` as any)}
        >
          <Text style={styles.startBtnText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#212020',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Background image — fill entire screen
  bgImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },

  // Dark overlay on entire screen
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },

  // Top header row
  topRow: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: { padding: 4 },
  topIcons: { flexDirection: 'row', gap: 16 },

  // Purple banner — positioned at bottom 42% of screen
  infoBanner: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#B3A0FF',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  runIconWrap: {
    position: 'absolute',
    top: -22,
    left: 20,
    width: 44,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  challengeTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
    marginLeft: 60, // offset for the icon
    marginBottom: 10,
    textTransform: 'capitalize',
  },

  description: {
    color: '#232323',
    fontSize: 14,
    fontFamily: 'League Spartan',
    fontWeight: '300',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 6,
  },

  // Glassmorphism "Start Now" pill — centered, 250px wide
  startBtn: {
    alignSelf: 'center',
    width: 250,
    height: 44,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.09)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'League Spartan',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
