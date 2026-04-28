import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { workoutService, Workout } from '../../../../services/workout.service';
import { COLORS } from '../../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteStore } from '../../../../store/favoriteStore';

const { width } = Dimensions.get('window');
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function WorkoutScreen() {
  const router = useRouter();
  
  const [activeLevel, setActiveLevel] = useState<string>('beginner');
  const [trainingOfDay, setTrainingOfDay] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleFavorite = useFavoriteStore(state => state.toggleFavorite);
  const isFavorite = useFavoriteStore(state => state.isFavorite);
  const fetchFavorites = useFavoriteStore(state => state.fetchFavorites);

  const handleToggleFavorite = async (workoutId: string) => {
    const nowFav = isFavorite(workoutId);
    await toggleFavorite(workoutId);
    if (!nowFav) {
      showToast('Added to favorites ❤️');
    } else {
      showToast('Removed from favorites 💔');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  useEffect(() => {
    fetchData();
    fetchFavorites(); // Tải danh sách favorites để highlight icon sao đúng
  }, [activeLevel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [todData, listData] = await Promise.all([
        workoutService.getTrainingOfDay(activeLevel),
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Dark Section */}
        <View style={styles.topSection}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="caret-back" size={20} color="#E2F163" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Workout</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity><Ionicons name="search" size={22} color="#896CFE" /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="notifications" size={22} color="#896CFE" /></TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/profile' as any)}>
                <Ionicons name="person" size={22} color="#896CFE" />
              </TouchableOpacity>
            </View>
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
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#E2F163" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Purple Section: Training of the Day */}
            <View style={styles.purpleSection}>
              {trainingOfDay && (
                <TouchableOpacity 
                  style={styles.todCard} 
                  onPress={() => router.push(`/workout/${trainingOfDay._id}`)}
                >
                  <Image source={{ uri: trainingOfDay.imageUrl || 'https://placehold.co/323x198' }} style={styles.todImage} />
                  <View style={styles.todOverlay}>
                    <View style={styles.todTopRow}>
                      <View style={{ flex: 1 }} />
                      <View style={styles.todTag}>
                        <Text style={styles.todTagText}>Training Of The Day</Text>
                      </View>
                    </View>
                    <View style={styles.todBottomRow}>
                      <View style={styles.todInfo}>
                        <Text style={styles.todTitle} numberOfLines={1}>{trainingOfDay.title}</Text>
                        <View style={styles.todStats}>
                          <Ionicons name="time-outline" size={12} color="white" />
                          <Text style={styles.todStatText}>{trainingOfDay.duration} Minutes</Text>
                          <Ionicons name="flame-outline" size={12} color="white" style={{ marginLeft: 6 }} />
                          <Text style={styles.todStatText}>{trainingOfDay.calories} Kcal</Text>
                          <Ionicons name="barbell-outline" size={12} color="white" style={{ marginLeft: 6 }} />
                          <Text style={styles.todStatText}>{trainingOfDay.exercisesCount} Exercises</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.starIconContainer}
                        onPress={() => handleToggleFavorite(trainingOfDay._id)}
                      >
                        <Ionicons 
                          name={isFavorite(trainingOfDay._id) ? "star" : "star-outline"} 
                          size={24} 
                          color={isFavorite(trainingOfDay._id) ? "#E2F163" : "white"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom Dark Section: Explore */}
            <View style={styles.bottomSection}>
              <Text style={styles.sectionTitleMain}>Let's Go {activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1)}</Text>
              <Text style={styles.sectionSubtitle}>Explore Different Workout Styles</Text>
              
              <View style={styles.workoutList}>
                {workouts.map(item => (
                  <TouchableOpacity 
                    key={item._id} 
                    style={styles.workoutCard}
                    onPress={() => router.push(`/workout/${item._id}`)}
                  >
                    <View style={styles.workoutCardInfo}>
                      <Text style={styles.workoutCardTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.workoutCardStatsRow}>
                        <View style={styles.statItem}>
                          <Ionicons name="time" size={12} color="#212020" />
                          <Text style={styles.workoutCardStat}>{item.duration} Minutes</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="flame" size={12} color="#212020" />
                          <Text style={styles.workoutCardStat}>{item.calories} Kcal</Text>
                        </View>
                      </View>
                      <View style={styles.workoutCardStatsRow}>
                        <View style={styles.statItem}>
                          <Ionicons name="walk" size={12} color="#212020" />
                          <Text style={styles.workoutCardStat}>{item.exercisesCount} Exercises</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.workoutCardImageContainer}>
                      <Image source={{ uri: item.imageUrl || 'https://placehold.co/150x120' }} style={styles.workoutCardImage} />
                      <TouchableOpacity 
                        style={styles.smallStarContainer}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item._id);
                        }}
                      >
                        <Ionicons 
                          name={isFavorite(item._id) ? "star" : "star-outline"} 
                          size={18} 
                          color={isFavorite(item._id) ? "#E2F163" : "white"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Simple Toast */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  scrollContent: { paddingBottom: 100 },
  
  topSection: { padding: 20, backgroundColor: '#212020' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#896CFE', fontSize: 24, fontWeight: '700' },
  headerIcons: { flexDirection: 'row', gap: 16 },
  
  filterContainer: { flexDirection: 'row', gap: 12 },
  filterPill: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 100 },
  filterPillActive: { backgroundColor: '#E2F163' },
  filterPillInactive: { backgroundColor: 'white' },
  filterText: { fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#212020' },
  filterTextInactive: { color: '#896CFE' },

  purpleSection: { backgroundColor: '#B3A0FF', padding: 20, paddingVertical: 30 },
  todCard: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', position: 'relative' },
  todImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  todOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  todTopRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: 12 },
  todTag: { backgroundColor: '#E2F163', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  todTagText: { color: '#212020', fontSize: 12, fontWeight: '700' },
  todBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: 'rgba(33, 32, 32, 0.85)', padding: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  todInfo: { flex: 1, paddingRight: 8 },
  todTitle: { color: '#E2F163', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  todStats: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', rowGap: 4 },
  todStatText: { color: 'white', fontSize: 11, marginLeft: 4, marginRight: 8 },
  starIconContainer: { padding: 4 },

  bottomSection: { padding: 20, backgroundColor: '#212020' },
  sectionTitleMain: { color: '#E2F163', fontSize: 20, fontWeight: '600', marginBottom: 4 },
  sectionSubtitle: { color: 'white', fontSize: 14, opacity: 0.8, marginBottom: 24 },
  
  workoutList: { gap: 16 },
  workoutCard: { backgroundColor: 'white', borderRadius: 20, flexDirection: 'row', overflow: 'hidden', height: 120 },
  workoutCardInfo: { flex: 1, padding: 16, justifyContent: 'center' },
  workoutCardTitle: { color: '#212020', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  workoutCardStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, minWidth: 70 },
  workoutCardStat: { color: '#212020', fontSize: 11, marginLeft: 4, opacity: 0.8 },
  
  workoutCardImageContainer: { width: 140, height: '100%', position: 'relative' },
  workoutCardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  smallStarContainer: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(33, 32, 32, 0.4)', padding: 6, borderRadius: 20 },
  
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#896CFE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  }
});
