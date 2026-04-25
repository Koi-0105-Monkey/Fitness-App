import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.icon}>📚</Text>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Articles & Videos coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  icon: { fontSize: 64 },
  title: { color: 'white', fontSize: 24, fontFamily: 'Poppins', fontWeight: '700' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, fontFamily: 'League Spartan' },
});
