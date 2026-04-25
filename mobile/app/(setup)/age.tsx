import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useSetupStore } from '../../store/setupStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 60;
const MIN_AGE = 15;
const MAX_AGE = 65;

const ages = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

export default function AgeScreen() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState(28);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    const clamped = Math.max(0, Math.min(index, ages.length - 1));
    if (ages[clamped] !== selectedAge) {
      setSelectedAge(ages[clamped]);
    }
  }, [selectedAge]);

  const renderItem = useCallback(({ item }: { item: number }) => {
    const isSelected = item === selectedAge;
    return (
      <View style={[styles.ageItem, { width: ITEM_WIDTH }]}>
        <Text style={[styles.ageText, isSelected && styles.ageTextSelected]}>
          {item}
        </Text>
      </View>
    );
  }, [selectedAge]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>How Old Are You?</Text>
      <Text style={styles.subtitle}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Text>

      <View style={styles.selectionArea}>
        <Text style={styles.bigNumber}>{selectedAge}</Text>
        <Ionicons name="caret-up" size={22} color={COLORS.accent} style={{ marginTop: -8, marginBottom: 16 }} />

        <View style={styles.pickerContainer}>
          <View style={styles.pickerHighlight} />
          {/* Selection borders */}
          <View style={[styles.pickerBorder, { left: SCREEN_WIDTH / 2 - ITEM_WIDTH / 2 }]} />
          <View style={[styles.pickerBorder, { left: SCREEN_WIDTH / 2 + ITEM_WIDTH / 2 - 2 }]} />

          <Animated.FlatList
            data={ages}
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
            initialScrollIndex={ages.indexOf(28)}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          useSetupStore.getState().updateData({ age: selectedAge });
          router.push('/(setup)/weight' as any);
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
  subtitle: { color: '#888', fontSize: 12, textAlign: 'center', paddingHorizontal: 40, lineHeight: 18, marginBottom: 50 },
  selectionArea: { alignItems: 'center' },
  bigNumber: { color: 'white', fontSize: 64, fontWeight: '700' },
  pickerContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    position: 'relative',
  },
  pickerHighlight: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.purple,
  },
  pickerBorder: {
    position: 'absolute', top: 0, bottom: 0,
    width: 2, backgroundColor: 'white', zIndex: 1,
  },
  ageItem: { justifyContent: 'center', alignItems: 'center', height: 80 },
  ageText: { fontSize: 26, fontWeight: '600', color: 'rgba(35,35,35,0.5)' },
  ageTextSelected: { color: 'white', fontSize: 34 },
  continueButton: {
    position: 'absolute', bottom: 50, alignSelf: 'center',
    width: 178, height: 44,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 100, borderWidth: 0.5, borderColor: 'white',
    justifyContent: 'center', alignItems: 'center',
  },
  continueButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
});
