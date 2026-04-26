import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { resourceService, ResourceItem } from '../../services/resource.service';

// ─── Filter Data ──────────────────────────────────────────────────────────────
const MUSCLE_TAGS = [
  { label: 'Abs', value: 'abs' },
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Legs', value: 'legs' },
  { label: 'Glutes', value: 'glutes' },
  { label: 'Biceps', value: 'biceps' },
  { label: 'Triceps', value: 'triceps' },
  { label: 'Front Deltoid', value: 'front_deltoid' },
  { label: 'Mid Deltoid', value: 'mid_deltoid' },
  { label: 'Rear Deltoid', value: 'rear_deltoid' },
];
const EQUIP_TAGS = [
  { label: 'Gym Machine', value: 'gym_machine' },
  { label: 'Bodyweight', value: 'bodyweight' },
  { label: 'Dumbbell', value: 'dumbbell' },
  { label: 'Barbell', value: 'barbell' },
  { label: 'Resistance Band', value: 'resistance_band' },
];
const SPORT_TAGS = [
  { label: 'Cardio', value: 'cardio' },
  { label: 'Yoga', value: 'yoga' },
  { label: 'Boxing', value: 'boxing' },
  { label: 'Stretching', value: 'stretching' },
];

type TopTab = 'workout' | 'article';
type SubTab = 'all' | 'muscle' | 'equipment' | 'sport';

// ─── Resource Card ─────────────────────────────────────────────────────────────
function ResourceCard({ item, onPress }: { item: ResourceItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.rCard} onPress={onPress}>
      <View style={styles.rCardImg}>
        {item.thumbnailUrl
          ? <Image source={{ uri: item.thumbnailUrl }} style={styles.rCardImgInner} />
          : <View style={[styles.rCardImgInner, { backgroundColor: '#2a2a3a', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="videocam" size={28} color="rgba(255,255,255,0.3)" />
            </View>
        }
        {item.videoUrl && (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={16} color="white" />
          </View>
        )}
        <TouchableOpacity style={styles.rCardStar}>
          <Ionicons name="star-outline" size={14} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.rCardTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.rCardMeta}>
        {item.type === 'video' && item.duration > 0 && (
          <View style={styles.metaChip}>
            <Ionicons name="time" size={10} color={COLORS.purple} />
            <Text style={styles.metaText}>{item.duration} Min</Text>
          </View>
        )}
        <View style={styles.metaChip}>
          <Ionicons name="walk" size={10} color={COLORS.purple} />
          <Text style={styles.metaText}>{item.muscleGroups.length || '—'} muscles</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Filter Pill Strip ──────────────────────────────────────────────────────
function PillStrip({
  tags, selected, onSelect
}: { tags: { label: string; value: string }[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.pillScroll}
      contentContainerStyle={styles.pillRow}
    >
      {tags.map(t => (
        <TouchableOpacity
          key={t.value}
          style={[styles.pill, selected === t.value && styles.pillActive]}
          onPress={() => onSelect(selected === t.value ? '' : t.value)}
        >
          <Text style={[styles.pillText, selected === t.value && styles.pillTextActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ResourcesScreen() {
  const router = useRouter();

  const [topTab, setTopTab] = useState<TopTab>('workout');
  const [subTab, setSubTab] = useState<SubTab>('all');

  // Filter selections per subTab
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquip,  setSelectedEquip]  = useState('');
  const [selectedSport,  setSelectedSport]  = useState('');

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [topTab, selectedMuscle, selectedEquip, selectedSport]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getResources({
        type: topTab === 'workout' ? 'video' : 'article',
        muscleGroup: selectedMuscle || undefined,
        equipment:   selectedEquip  || undefined,
        sport:       selectedSport  || undefined,
      });
      setResources(data);
    } catch (e) {
      console.log('Error fetching resources:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubTab = (tab: SubTab) => {
    setSubTab(tab);
    // Reset all filters first
    setSelectedMuscle('');
    setSelectedEquip('');
    setSelectedSport('');
    
    // Set base defaults
    if (tab === 'muscle') setSelectedMuscle('abs');
    if (tab === 'equipment') setSelectedEquip('gym_machine');
    if (tab === 'sport') setSelectedSport('cardio');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="caret-back" size={20} color={COLORS.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resources</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity><Ionicons name="search" size={22} color={COLORS.purple} /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="notifications" size={22} color={COLORS.purple} /></TouchableOpacity>
        </View>
      </View>

      {/* Top Tabs: Workout Videos / Articles & Tips */}
      <View style={styles.topTabRow}>
        <TouchableOpacity
          style={[styles.topTab, topTab === 'workout' && styles.topTabActive]}
          onPress={() => { setTopTab('workout'); setSubTab('all'); }}
        >
          <Text style={[styles.topTabText, topTab === 'workout' && styles.topTabTextActive]}>Workout Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, topTab === 'article' && styles.topTabActive]}
          onPress={() => { setTopTab('article'); setSubTab('all'); }}
        >
          <Text style={[styles.topTabText, topTab === 'article' && styles.topTabTextActive]}>Articles & Tips</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs (only for workout) */}
      {topTab === 'workout' && (
        <View style={styles.subTabRow}>
          {(['all', 'muscle', 'equipment', 'sport'] as SubTab[]).map(tab => {
            const labels: Record<SubTab, string> = { all: 'All', muscle: 'Muscle Group', equipment: 'Equipment', sport: 'Discipline' };
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.subTab, subTab === tab && styles.subTabActive]}
                onPress={() => handleSubTab(tab)}
              >
                <Text style={[styles.subTabText, subTab === tab && styles.subTabTextActive]}>{labels[tab]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Filter Pill Strip */}
      {topTab === 'workout' && subTab === 'muscle' && (
        <PillStrip tags={MUSCLE_TAGS} selected={selectedMuscle} onSelect={setSelectedMuscle} />
      )}
      {topTab === 'workout' && subTab === 'equipment' && (
        <PillStrip tags={EQUIP_TAGS} selected={selectedEquip} onSelect={setSelectedEquip} />
      )}
      {topTab === 'workout' && subTab === 'sport' && (
        <PillStrip tags={SPORT_TAGS} selected={selectedSport} onSelect={setSelectedSport} />
      )}

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {topTab === 'workout' ? 'Quick & Easy Workout Videos' : 'Articles & Tips'}
        </Text>
        <Text style={styles.sectionSub}>
          {topTab === 'workout' ? 'Discover Fresh Workouts · Elevate Your Training' : 'Knowledge to fuel your fitness'}
        </Text>
      </View>

      {/* Grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : resources.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="videocam-off" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>No content found</Text>
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={r => r._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ResourceCard
              item={item}
              onPress={() => router.push(`/resources/${item._id}` as any)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { color: COLORS.purple, fontSize: 22, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 14 },

  topTabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 30,
    padding: 4,
    marginBottom: 14,
  },
  topTab: { flex: 1, paddingVertical: 9, borderRadius: 26, alignItems: 'center' },
  topTabActive: { backgroundColor: COLORS.accent },
  topTabText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  topTabTextActive: { color: '#212020', fontWeight: '700' },

  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 10,
  },
  subTab: {
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  subTabActive: { borderColor: COLORS.purple, backgroundColor: 'rgba(137,108,254,0.12)' },
  subTabText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  subTabTextActive: { color: COLORS.purple },
  pillScroll: { maxHeight: 50, marginBottom: 10, flexGrow: 0 },

  pillRow: { 
    paddingHorizontal: 20, 
    gap: 8, 
    height: 40, // Cố định chiều cao để không bị kéo dài
    alignItems: 'center',
  },
  pill: {
    paddingVertical: 6, 
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    height: 32, // Đảm bảo chiều cao nút nhỏ gọn
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: COLORS.purple },
  pillText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: 'white', fontWeight: '700' },

  sectionHeader: { paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { color: COLORS.accent, fontSize: 16, fontWeight: '700' },
  sectionSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },

  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { gap: 12, marginBottom: 12 },

  // Resource Card
  rCard: { flex: 1, maxWidth: '50%' },
  rCardImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  rCardImgInner: { width: '100%', height: '100%', resizeMode: 'cover' },
  playOverlay: {
    position: 'absolute',
    bottom: 8, right: 8,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rCardStar: { position: 'absolute', top: 8, right: 8 },
  rCardTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 4,
  },
  rCardMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
});
