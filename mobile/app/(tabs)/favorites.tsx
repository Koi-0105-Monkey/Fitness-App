import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useFavoriteStore } from '../../store/favoriteStore';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, isLoading, fetchFavorites, toggleFavorite } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || '';
    return `${baseUrl}${url}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Favorites</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {favorites.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="star-outline" size={60} color={COLORS.purple} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>You haven't added any workouts to your favorites yet.</Text>
              <TouchableOpacity 
                style={styles.browseBtn}
                onPress={() => router.push('/(tabs)/workout')}
              >
                <Text style={styles.browseBtnText}>Explore Workouts</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {favorites.map(item => (
                <TouchableOpacity
                  key={item.workout._id}
                  style={styles.card}
                  onPress={() => router.push(`/workout/${item.workout._id}`)}
                >
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.workout.title}</Text>

                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="time" size={12} color="#212020" />
                        <Text style={styles.statText}>{item.workout.duration} Mins</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="flame" size={12} color="#212020" />
                        <Text style={styles.statText}>{item.workout.calories || 0} Kcal</Text>
                      </View>
                    </View>

                    <Text style={styles.dateText}>
                      Added on {formatDate(item.addedAt)}
                    </Text>
                  </View>

                  <View style={styles.cardImageContainer}>
                    <Image source={{ uri: getImageUrl(item.workout.image || item.workout.imageUrl) }} style={styles.cardImage} />
                    <TouchableOpacity
                      style={styles.starIconContainer}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.workout._id);
                      }}
                    >
                      <Ionicons name="star" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.purple,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: 'white',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
    fontSize: 14,
  },
  browseBtn: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  browseBtnText: {
    color: '#212020',
    fontWeight: '700',
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 120,
  },
  cardInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#212020',
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    color: '#212020',
    fontSize: 11,
    marginLeft: 4,
    opacity: 0.8,
  },
  dateText: {
    color: '#896CFE',
    fontSize: 11,
    fontWeight: '600',
  },
  cardImageContainer: {
    width: 140,
    height: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  starIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(33, 32, 32, 0.4)',
    padding: 6,
    borderRadius: 20,
  },
});
