import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { recommendationService } from '../services/resource.service';
import { Workout } from '../services/workout.service';
import { useFavoriteStore } from '../store/favoriteStore';

type RecoWorkout = Workout & { favoritesCount: number };

export default function RecommendationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<RecoWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  useEffect(() => {
    (async () => {
      try {
        const data = await recommendationService.getRecommendations();
        setItems(data);
      } catch (e) {
        console.log('Error fetching recommendations:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="caret-back" size={18} color={COLORS.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommendations</Text>
        <View style={{ width: 32 }} />
      </View>

      <Text style={styles.subtitle}>
        Sorted by most favorited · {items.length} workouts
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => router.push(`/workout/${item._id}`)}
            >
              {/* Rank badge */}
              <View style={[styles.rankBadge, index < 3 && styles.rankTop]}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>

              <Image
                source={{ uri: item.imageUrl || 'https://placehold.co/120x100' }}
                style={styles.cardImage}
              />

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.statsRow}>
                  <Ionicons name="time" size={12} color="#212020" />
                  <Text style={styles.statText}>{item.duration} Mins</Text>
                  <Ionicons name="flame" size={12} color="#212020" style={{ marginLeft: 8 }} />
                  <Text style={styles.statText}>{item.calories} Kcal</Text>
                </View>
                <View style={styles.statsRow}>
                  <Ionicons name="star" size={12} color={COLORS.accent} />
                  <Text style={[styles.statText, { color: COLORS.purple, fontWeight: '600' }]}>
                    {item.favoritesCount} favorites
                  </Text>
                  <View style={[styles.levelPill, { marginLeft: 8 }]}>
                    <Text style={styles.levelText}>{item.level}</Text>
                  </View>
                </View>
              </View>

              {/* Favorite star */}
              <TouchableOpacity
                style={styles.starBtn}
                onPress={() => toggleFavorite(item._id)}
              >
                <Ionicons
                  name={isFavorite(item._id) ? 'star' : 'star-outline'}
                  size={20}
                  color={isFavorite(item._id) ? COLORS.accent : 'white'}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#fbbf24',
  advanced: '#f87171',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.purple,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { width: 32, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700', fontFamily: 'Poppins' },

  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  list: { padding: 20, gap: 12, paddingBottom: 40 },

  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    height: 110,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: 'rgba(33,32,32,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  rankTop: { backgroundColor: COLORS.purple },
  rankText: { color: 'white', fontSize: 11, fontWeight: '800' },

  cardImage: { width: 130, height: '100%', resizeMode: 'cover' },

  cardBody: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  cardTitle: { color: '#212020', fontSize: 14, fontWeight: '700', lineHeight: 20 },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#212020', fontSize: 11, marginLeft: 4, opacity: 0.8 },

  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: 'rgba(137,108,254,0.12)',
  },
  levelText: { fontSize: 10, fontWeight: '700', color: COLORS.purple, textTransform: 'capitalize' },

  starBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(33,32,32,0.4)',
    padding: 6,
    borderRadius: 20,
  },
});
