import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useSetupStore } from '../../store/setupStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 14;
const VISIBLE_ITEMS = Math.ceil(SCREEN_WIDTH / ITEM_WIDTH);
const MIN_WEIGHT = 30;
const MAX_WEIGHT = 200;

const weights = Array.from({ length: MAX_WEIGHT - MIN_WEIGHT + 1 }, (_, i) => MIN_WEIGHT + i);

export default function WeightScreen() {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState(75);
  const [unit, setUnit] = useState<'KG' | 'LB'>('KG');
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    const clamped = Math.max(0, Math.min(index, weights.length - 1));
    if (weights[clamped] !== selectedWeight) {
      setSelectedWeight(weights[clamped]);
    }
  }, [selectedWeight]);

  const displayWeight = unit === 'LB' ? Math.round(selectedWeight * 2.205) : selectedWeight;

  const renderItem = useCallback(({ item, index }: { item: number; index: number }) => {
    const isMajor = item % 5 === 0;
    return (
      <View style={[styles.tickContainer, { width: ITEM_WIDTH }]}>
        <View style={[styles.tick, isMajor ? styles.tickMajor : styles.tickMinor]} />
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>What Is Your Weight?</Text>
      <Text style={styles.subtitle}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Text>

      {/* Unit Toggle */}
      <View style={styles.unitToggleContainer}>
        <View style={styles.unitToggle}>
          <TouchableOpacity style={styles.unitButton} onPress={() => setUnit('KG')}>
            <Text style={[styles.unitText, unit === 'KG' && styles.unitTextSelected]}>KG</Text>
          </TouchableOpacity>
          <View style={styles.unitDivider} />
          <TouchableOpacity style={styles.unitButton} onPress={() => setUnit('LB')}>
            <Text style={[styles.unitText, unit === 'LB' && styles.unitTextSelected]}>LB</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Numbers display */}
      <View style={styles.numbersRow}>
        {[-2, -1, 0, 1, 2].map((offset) => {
          const num = selectedWeight + offset;
          if (num < MIN_WEIGHT || num > MAX_WEIGHT) return <Text key={offset} style={styles.numberText}> </Text>;
          const isCenter = offset === 0;
          return (
            <Text key={offset} style={[styles.numberText, isCenter && styles.numberCenter]}>
              {num}
            </Text>
          );
        })}
      </View>

      {/* Ruler picker */}
      <View style={styles.rulerContainer}>
        <View style={styles.rulerBg} />
        <View style={styles.centerLine} />
        <Animated.FlatList
          ref={flatListRef}
          data={weights}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: SCREEN_WIDTH / 2 - ITEM_WIDTH / 2 }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true, listener: handleScroll }
          )}
          scrollEventThrottle={16}
          initialScrollIndex={75 - MIN_WEIGHT}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
        />
      </View>

      {/* Caret + big number */}
      <View style={styles.valueSection}>
        <Ionicons name="caret-up" size={20} color={COLORS.accent} />
        <View style={styles.valueRow}>
          <Text style={styles.bigNumber}>{displayWeight}</Text>
          <Text style={styles.unitLabel}>{unit}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          useSetupStore.getState().updateData({ weight: selectedWeight });
          router.push('/(setup)/height' as any);
        }}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: COLORS.accent, fontSize: 16, fontWeight: '500', marginLeft: 4 },
  title: { color: 'white', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  subtitle: { color: '#888', fontSize: 12, textAlign: 'center', paddingHorizontal: 40, lineHeight: 18, marginBottom: 30 },

  unitToggleContainer: { alignItems: 'center', marginBottom: 50 },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    width: 200,
    height: 40,
    alignItems: 'center',
  },
  unitButton: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  unitDivider: { width: 2, height: '60%', backgroundColor: '#232323' },
  unitText: { color: '#232323', fontWeight: '600', fontSize: 14, opacity: 0.5 },
  unitTextSelected: { opacity: 1, fontWeight: '700' },

  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  numberText: { color: '#888', fontSize: 18, fontWeight: '600', width: 40, textAlign: 'center' },
  numberCenter: { color: 'white', fontSize: 22, fontWeight: '700' },

  rulerContainer: {
    height: 60,
    position: 'relative',
    justifyContent: 'center',
  },
  rulerBg: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: COLORS.purple,
  },
  centerLine: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 1,
    top: 5, bottom: 5,
    width: 2,
    backgroundColor: COLORS.accent,
    zIndex: 10,
  },
  tickContainer: { justifyContent: 'center', alignItems: 'center', height: 60 },
  tick: { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 1 },
  tickMajor: { width: 2, height: 30 },
  tickMinor: { width: 1.5, height: 16 },

  valueSection: { alignItems: 'center', marginTop: 12 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  bigNumber: { color: 'white', fontSize: 60, fontWeight: '700' },
  unitLabel: { color: 'white', fontSize: 22, fontWeight: '600', marginLeft: 6 },

  continueButton: {
    position: 'absolute', bottom: 50, alignSelf: 'center',
    width: 178, height: 44,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 100, borderWidth: 0.5, borderColor: 'white',
    justifyContent: 'center', alignItems: 'center',
  },
  continueButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
});
