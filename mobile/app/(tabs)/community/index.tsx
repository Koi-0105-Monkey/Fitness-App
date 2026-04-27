import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { useRouter } from 'expo-router';
import { workoutService, Workout } from '../../../services/workout.service';

type Tab = 'forum' | 'challenges';

// ─── Mock Forum Data ──────────────────────────────────────────────────────────
const FORUM_TOPICS = [
  { id: '1', title: 'Strength Training Techniques', description: 'Discussion on training methods', time: 'Today 17:05' },
  { id: '2', title: 'Nutrition and Diet Strategies', description: 'Meal planning, supplementation preferences', time: 'Today 17:05' },
  { id: '3', title: 'Cardiovascular Fitness', description: 'About different types of cardio workouts', time: 'Today 17:05' },
  { id: '4', title: 'Strength Training Techniques', description: 'Strategies for improving flexibility and joint mobility to prevent injuries', time: 'Today 17:05' },
];

const FORUM_POSTS = [
  { id: '1', user: 'Madison', content: 'Lorem ipsum dolor sit amet consectetur. Tortor aenean suspendisse pretium nunc non facilisi.', likes: '30,254', comments: '12,254', views: '1,254', saved: false },
  { id: '2', user: 'Madison', content: 'Lorem ipsum dolor sit amet consectetur. Tortor aenean suspendisse pretium nunc non facilisi.', likes: '30,254', comments: '12,254', views: '1,254', saved: true },
  { id: '3', user: 'Madison', content: 'Lorem ipsum dolor sit amet consectetur. Tortor aenean suspendisse pretium nunc non facilisi.', likes: '30,254', comments: '12,254', views: '1,254', saved: false },
  { id: '4', user: 'Madison', content: 'Lorem ipsum dolor sit amet consectetur. Tortor aenean suspendisse pretium nunc non facilisi.', likes: '30,254', comments: '12,254', views: '1,254', saved: false },
];

// ─── Local fallback images for challenges ─────────────────────────────────────
const LOCAL_IMAGES = [
  require('../../../assets/woman-helping-man-gym (1) 2.png'),
  require('../../../assets/woman-helping-man-gym (1) 3.png'),
  require('../../../assets/woman-helping-man-gym (1) 4.png'),
  require('../../../assets/woman-helping-man-gym (1) 5.png'),
];

// ─── Forum Post Card ──────────────────────────────────────────────────────────
function ForumPostCard({ item }: { item: typeof FORUM_POSTS[0] }) {
  const [saved, setSaved] = useState(item.saved);
  const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user)}&background=896CFE&color=fff&size=80`;

  return (
    <View style={styles.forumPostCard}>
      <View style={styles.forumPostHeader}>
        <Image source={{ uri: avatarUri }} style={styles.forumAvatar} />
        <Text style={styles.forumUserName}>{item.user}</Text>
        <TouchableOpacity onPress={() => setSaved(!saved)}>
          <Ionicons
            name={saved ? 'star' : 'star-outline'}
            size={16}
            color={saved ? COLORS.yellow : 'rgba(255,255,255,0.4)'}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.forumPostContent}>{item.content}</Text>
      <View style={styles.forumPostStats}>
        <View style={styles.forumStat}>
          <Ionicons name="star" size={13} color={COLORS.yellow} />
          <Text style={styles.forumStatText}>{item.likes}</Text>
        </View>
        <View style={styles.forumStat}>
          <Ionicons name="chatbubble-outline" size={13} color="rgba(255,255,255,0.5)" />
          <Text style={styles.forumStatText}>{item.comments}</Text>
        </View>
        <View style={styles.forumStat}>
          <Ionicons name="eye-outline" size={13} color="rgba(255,255,255,0.5)" />
          <Text style={styles.forumStatText}>{item.views}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Challenge Card ───────────────────────────────────────────────────────────
function ChallengeCard({ item, onPress }: { item: Workout; onPress: () => void }) {
  const imgSource = item.imageUrl
    ? { uri: item.imageUrl }
    : LOCAL_IMAGES[parseInt(item._id?.slice(-1) || '0', 16) % LOCAL_IMAGES.length];
  const challengeName = `${item.title} Challenge`;

  return (
    <TouchableOpacity style={styles.challengeCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.challengeTextBox}>
        <Text style={styles.challengeTitle}>{challengeName}</Text>
        <Text style={styles.challengeDesc} numberOfLines={3}>{item.description}</Text>
      </View>
      <Image source={imgSource} style={styles.challengeImage} resizeMode="cover" />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [featuredSaved, setFeaturedSaved] = useState(false);
  const [challenges, setChallenges] = useState<Workout[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);

  useEffect(() => {
    if (activeTab === 'challenges' && challenges.length === 0) {
      fetchChallenges();
    }
  }, [activeTab]);

  const fetchChallenges = async () => {
    try {
      setLoadingChallenges(true);
      const data = await workoutService.getWorkouts();
      setChallenges(data);
    } catch (e) {
      console.log('Error fetching challenges:', e);
    } finally {
      setLoadingChallenges(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="caret-back" size={18} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
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

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forum' && styles.tabActive]}
          onPress={() => setActiveTab(activeTab === 'forum' ? null : 'forum')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'forum' && styles.tabTextActive]}>
            Discussion Forum
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab(activeTab === 'challenges' ? null : 'challenges')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.tabTextActive]}>
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── DEFAULT LANDING VIEW ── */}
      {activeTab === null && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {/* Featured Challenge Card — tap to go to Challenges tab */}
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => setActiveTab('challenges')}
          >
            <Image
              source={require('../../../assets/beautiful-young-sporty-woman-training-workout-gym 4.png')}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <View style={styles.featuredOverlay} />
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>Cycling Challenge</Text>
              <View style={styles.featuredMeta}>
                <Ionicons name="time-outline" size={12} color="white" />
                <Text style={styles.featuredMetaText}>15 Minutes</Text>
                <Ionicons name="flame-outline" size={12} color="white" style={{ marginLeft: 8 }} />
                <Text style={styles.featuredMetaText}>100 Kcal</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.featuredStar}
              onPress={() => setFeaturedSaved(!featuredSaved)}
            >
              <Ionicons
                name={featuredSaved ? 'star' : 'star-outline'}
                size={20}
                color={featuredSaved ? COLORS.yellow : 'white'}
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Forums list */}
          <Text style={styles.sectionTitle}>Forums</Text>
          <View style={styles.forumsBox}>
            {FORUM_TOPICS.map((topic, idx) => (
              <TouchableOpacity
                key={topic.id}
                style={[styles.topicRow, idx < FORUM_TOPICS.length - 1 && styles.topicRowBorder]}
                activeOpacity={0.7}
                onPress={() => setActiveTab('forum')}
              >
                <View style={styles.topicLeft}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDesc} numberOfLines={2}>{topic.description}</Text>
                </View>
                <View style={styles.topicRight}>
                  <Text style={styles.topicSeeAll}>See All</Text>
                  <Text style={styles.topicTime}>{topic.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── DISCUSSION FORUM TAB ── */}
      {activeTab === 'forum' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <Text style={styles.sectionTitle}>Forums</Text>
          {FORUM_POSTS.map((post) => (
            <ForumPostCard key={post.id} item={post} />
          ))}
        </ScrollView>
      )}

      {/* ── CHALLENGES TAB ── */}
      {activeTab === 'challenges' && (
        loadingChallenges ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.yellow} />
          </View>
        ) : (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Challenges And Competitions</Text>
            }
            renderItem={({ item }) => (
              <ChallengeCard
                item={item}
                onPress={() => router.push(`/community/${item._id}` as any)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4, marginRight: 6 },
  headerTitle: { flex: 1, color: COLORS.purple, fontSize: 22, fontFamily: 'Poppins', fontWeight: '700' },
  headerIcons: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(137,108,254,0.12)', justifyContent: 'center', alignItems: 'center' },

  tabContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: 'rgba(137,108,254,0.12)', borderRadius: 100, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 100, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.yellow },
  tabText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: 'Poppins', fontWeight: '600' },
  tabTextActive: { color: '#232323' },

  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { color: COLORS.yellow, fontSize: 20, fontFamily: 'Poppins', fontWeight: '700', marginBottom: 14 },

  // Featured Card
  featuredCard: { borderRadius: 16, overflow: 'hidden', height: 210, marginBottom: 24, position: 'relative' },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  featuredInfo: { position: 'absolute', bottom: 14, left: 14 },
  featuredTitle: { color: 'white', fontSize: 18, fontFamily: 'Poppins', fontWeight: '700', marginBottom: 4 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredMetaText: { color: 'white', fontSize: 12, fontFamily: 'League Spartan' },
  featuredStar: { position: 'absolute', bottom: 14, right: 14 },

  // Forum Topics
  forumsBox: { backgroundColor: COLORS.purple, borderRadius: 14, overflow: 'hidden' },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 12 },
  topicRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)' },
  topicLeft: { flex: 1, paddingRight: 10 },
  topicTitle: { color: 'white', fontSize: 13, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 2 },
  topicDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'League Spartan', lineHeight: 15 },
  topicRight: { alignItems: 'flex-end', minWidth: 68 },
  topicSeeAll: { color: COLORS.yellow, fontSize: 12, fontFamily: 'League Spartan', fontWeight: '600', marginBottom: 4 },
  topicTime: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'League Spartan' },

  // Forum Post Cards
  forumPostCard: { backgroundColor: '#2A2A2A', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(137,108,254,0.25)' },
  forumPostHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  forumAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  forumUserName: { flex: 1, color: COLORS.yellow, fontSize: 15, fontFamily: 'Poppins', fontWeight: '700' },
  forumPostContent: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'League Spartan', lineHeight: 18, marginBottom: 12 },
  forumPostStats: { flexDirection: 'row', gap: 16 },
  forumStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  forumStatText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: 'League Spartan' },

  // Challenge Cards
  challengeCard: { flexDirection: 'row', backgroundColor: '#2A2A2A', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(137,108,254,0.2)' },
  challengeTextBox: { flex: 1, padding: 14, justifyContent: 'center' },
  challengeTitle: { color: 'white', fontSize: 16, fontFamily: 'Poppins', fontWeight: '700', marginBottom: 6 },
  challengeDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'League Spartan', lineHeight: 16 },
  challengeImage: { width: 110, height: 110 },
});
