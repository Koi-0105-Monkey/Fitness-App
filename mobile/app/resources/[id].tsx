import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { COLORS } from '../../constants/colors';
import { resourceService, ResourceItem } from '../../services/resource.service';

const { width } = Dimensions.get('window');

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [aspectRatio, setAspectRatio] = useState(16 / 9); // Mặc định 16:9

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await resourceService.getResourceById(id);
      setResource(data);
    } catch (e) {
      console.log('Error fetching resource detail:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: 'white' }}>Resource not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: COLORS.accent }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDuration = (sec: number) => {
    if (!sec) return '0s';
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="caret-back" size={20} color={COLORS.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{resource.title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity><Ionicons name="search" size={22} color={COLORS.purple} /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="notifications" size={22} color={COLORS.purple} /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="person" size={22} color={COLORS.purple} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video Player Container - Dynamic Height based on aspectRatio */}
        <View style={[styles.videoContainer, { height: width / aspectRatio }]}>
          {resource.videoUrl ? (
            <Video
              source={{ uri: resource.videoUrl }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls
              onReadyForDisplay={(event) => {
                const { width: vW, height: vH } = event.naturalSize;
                if (vW && vH) setAspectRatio(vW / vH);
              }}
              style={styles.video}
            />
          ) : (
            <View style={[styles.video, styles.center, { backgroundColor: '#000' }]}>
              <Ionicons name="videocam-off" size={48} color="rgba(255,255,255,0.2)" />
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>No video available</Text>
            </View>
          )}
          <TouchableOpacity style={styles.starFloating}>
            <Ionicons name="star" size={24} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Text style={styles.title}>{resource.title}</Text>
          <Text style={styles.description}>{resource.description || 'No description available for this workout video.'}</Text>
          
          <View style={styles.statsRow}>
            {resource.type === 'video' && (
              <View style={styles.statChip}>
                <Ionicons name="time" size={14} color="#212020" />
                <Text style={styles.statText}>{formatDuration(resource.duration)}</Text>
              </View>
            )}
            <View style={styles.statChip}>
              <Ionicons name="walk" size={14} color="#212020" />
              <Text style={styles.statText}>{resource.muscleGroups?.length || 0} Muscles</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav Mockup or Spacer */}
      <View style={{ height: 80 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { color: COLORS.purple, fontSize: 18, fontWeight: '700', flex: 1, marginHorizontal: 10 },
  headerRight: { flexDirection: 'row', gap: 12 },
  videoContainer: {
    width: width,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  starFloating: {
    position: 'absolute',
    top: 30,
    right: 30,
    zIndex: 10,
  },
  infoBox: {
    padding: 24,
  },
  title: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: 'white',
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 6,
  },
  statText: {
    color: '#212020',
    fontSize: 13,
    fontWeight: '600',
  },
  backBtn: {
    marginTop: 20,
    padding: 10,
  }
});
