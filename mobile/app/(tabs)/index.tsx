import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* 
  NOTE: ĐÂY LÀ TRANG HOME GIẢ (FAKE HOME) 
  Dùng để test tạm thời cho đến khi bạn của Quốc Anh làm xong Home xịn.
  Sau khi Home xịn xong thì hãy xoá hoặc thay thế file này.
*/

export default function FakeHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FITBODY HOME (FAKE)</Text>
        <Text style={styles.subtitle}>Click icon bên dưới để test màn hình Workout</Text>
        
        <TouchableOpacity 
          style={styles.workoutIconBtn}
          onPress={() => router.push('/(tabs)/workout')}
        >
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>🏋️‍♂️</Text>
          </View>
          <Text style={styles.btnLabel}>Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212020' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#E2F163', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: 'white', fontSize: 14, opacity: 0.7, marginBottom: 40, textAlign: 'center' },
  workoutIconBtn: { alignItems: 'center' },
  iconPlaceholder: { 
    width: 80, height: 80, backgroundColor: '#896CFE', 
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#896CFE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  iconText: { fontSize: 40 },
  btnLabel: { color: 'white', fontSize: 16, fontWeight: '600' }
});
