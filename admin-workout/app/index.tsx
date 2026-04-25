import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, ScrollView, 
  TouchableOpacity, Alert, ActivityIndicator, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { adminWorkoutService } from '../services/admin.service';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // Lưu ID của exercise đang upload

  const [workout, setWorkout] = useState({
    title: '',
    description: '',
    level: 'beginner',
    duration: 30,
    calories: 300,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    rounds: [
      {
        roundName: 'Round 1',
        exercises: [
          { id: Math.random().toString(), name: '', duration: '00:30', reps: '10x', videoUrl: '', description: '' }
        ]
      }
    ]
  });

  const pickMedia = async (rIdx: number | null, eIdx: number | null) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos', 'images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      handleUpload(result.assets[0].uri, rIdx, eIdx);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalDuration = (nextW: any) => {
    let totalSecs = 0;
    nextW.rounds.forEach((r: any) => r.exercises.forEach((ex: any) => {
      const timeParts = (ex.duration || '00:00').split(':');
      if (timeParts.length === 2) {
        const [m, s] = timeParts.map(Number);
        totalSecs += (m * 60) + (s || 0);
      }
    }));
    nextW.duration = Math.ceil(totalSecs / 60) || 1;
    return nextW;
  };

  const handleUpload = async (uri: string, rIdx: number | null, eIdx: number | null) => {
    const exId = (rIdx !== null && eIdx !== null) ? workout.rounds[rIdx].exercises[eIdx].id : 'main-image';
    try {
      setUploading(exId);
      
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', {
        uri,
        name: uri.split('/').pop(),
        type: uri.endsWith('.mp4') ? 'video/mp4' : (uri.endsWith('.png') ? 'image/png' : 'image/jpeg'),
      });

      const response = await fetch('http://192.168.1.13:5000/api/upload', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resData = await response.json();
      if (resData.success) {
        let nextW = { ...workout };
        if (rIdx !== null && eIdx !== null) {
          nextW.rounds[rIdx].exercises[eIdx].videoUrl = resData.data.url;
          if (resData.data.duration) {
            nextW.rounds[rIdx].exercises[eIdx].duration = formatTime(resData.data.duration);
          }
        } else {
          nextW.imageUrl = resData.data.url;
        }
        
        nextW = calculateTotalDuration(nextW);
        setWorkout(nextW);
        Alert.alert('Thành công', 'Đã cập nhật file và thời lượng!');
      }
    } catch (error) {
      console.log('Upload Error:', error);
      Alert.alert('Lỗi', 'Không thể upload file');
    } finally {
      setUploading(null);
    }
  };

  const addRound = () => {
    const nextW = { ...workout };
    nextW.rounds.push({
      roundName: `Round ${nextW.rounds.length + 1}`,
      exercises: [{ id: Math.random().toString(), name: '', duration: '00:00', reps: '10x', videoUrl: '', description: '' }]
    });
    setWorkout(nextW);
  };

  const removeRound = (rIdx: number) => {
    if (workout.rounds.length <= 1) return;
    const nextW = { ...workout };
    nextW.rounds.splice(rIdx, 1);
    setWorkout(calculateTotalDuration(nextW));
  };

  const addExercise = (rIdx: number) => {
    const nextW = { ...workout };
    nextW.rounds[rIdx].exercises.push({
      id: Math.random().toString(),
      name: '', duration: '00:00', reps: '10x', videoUrl: '', description: ''
    });
    setWorkout(nextW);
  };

  const removeExercise = (rIdx: number, eIdx: number) => {
    const nextW = { ...workout };
    nextW.rounds[rIdx].exercises.splice(eIdx, 1);
    setWorkout(calculateTotalDuration(nextW));
  };

  const handleSave = async () => {
    if (!workout.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài tập');
      return;
    }
    try {
      setLoading(true);
      const cleanWorkout = { ...workout };
      cleanWorkout.rounds = workout.rounds.map(round => ({
        ...round,
        exercises: round.exercises.filter(ex => ex.name.trim() !== '')
      })).filter(round => round.exercises.length > 0);

      if (cleanWorkout.rounds.length === 0) {
        Alert.alert('Lỗi', 'Bài tập phải có ít nhất 1 động tác hợp lệ');
        setLoading(false);
        return;
      }

      await adminWorkoutService.createWorkout(cleanWorkout);
      Alert.alert('Thành công', 'Đã thêm bài tập mới!');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu bài tập');
    } finally {
      setLoading(false);
    }
  };

  const LEVELS = ['beginner', 'intermediate', 'advanced'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>FITBODY ADMIN 🏋️‍♂️</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          
          <View style={styles.mainImageArea}>
            <TouchableOpacity 
              style={styles.mainImageBtn} 
              onPress={() => pickMedia(null, null)}
              disabled={uploading === 'main-image'}
            >
              {uploading === 'main-image' ? (
                <ActivityIndicator color="#E2F163" />
              ) : (
                <Image 
                  source={{ uri: workout.imageUrl || 'https://placehold.co/323x198' }} 
                  style={styles.mainImagePreview} 
                />
              )}
              <View style={styles.mainImageOverlay}>
                <Text style={styles.mainImageText}>Thay ảnh đại diện</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.input} 
            placeholder="Tên bài tập" 
            placeholderTextColor="#666"
            value={workout.title}
            onChangeText={(v) => setWorkout({...workout, title: v})}
          />

          <Text style={styles.label}>Cấp độ:</Text>
          <View style={styles.levelContainer}>
            {LEVELS.map(l => (
              <TouchableOpacity 
                key={l} 
                style={[styles.levelPill, workout.level === l && styles.levelPillActive]}
                onPress={() => setWorkout({...workout, level: l})}
              >
                <Text style={[styles.levelText, workout.level === l && styles.levelTextActive]}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput 
            style={[styles.input, { height: 80 }]} 
            placeholder="Mô tả" 
            placeholderTextColor="#666"
            multiline
            value={workout.description}
            onChangeText={(v) => setWorkout({...workout, description: v})}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Tổng phút (Tự động):</Text>
              <TextInput style={[styles.input, { backgroundColor: '#333' }]} value={String(workout.duration)} editable={false} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.label}>Tổng Kcal:</Text>
              <TextInput style={styles.input} value={String(workout.calories)} keyboardType="numeric" onChangeText={(v) => setWorkout({...workout, calories: Number(v)})} />
            </View>
          </View>
        </View>

        {workout.rounds.map((round, rIdx) => (
          <View key={rIdx} style={styles.section}>
            <View style={styles.roundHeader}>
              <TextInput 
                style={styles.roundNameInput} 
                value={round.roundName}
                onChangeText={(v) => {
                  const nextW = {...workout};
                  nextW.rounds[rIdx].roundName = v;
                  setWorkout(nextW);
                }}
              />
              <TouchableOpacity onPress={() => removeRound(rIdx)}>
                <Text style={styles.removeText}>Xoá Round</Text>
              </TouchableOpacity>
            </View>

            {round.exercises.map((ex, eIdx) => (
              <View key={ex.id || eIdx} style={styles.exerciseRow}>
                <View style={styles.exHeader}>
                  <TextInput 
                    style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                    placeholder="Tên động tác" 
                    placeholderTextColor="#666"
                    value={ex.name}
                    onChangeText={(v) => {
                      const nextW = {...workout};
                      nextW.rounds[rIdx].exercises[eIdx].name = v;
                      setWorkout(nextW);
                    }}
                  />
                  <TouchableOpacity style={styles.miniRemove} onPress={() => removeExercise(rIdx, eIdx)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.exSubRow}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.miniLabel}>Số Rep/Set (VD: 3 sets / 12 reps):</Text>
                    <TextInput 
                      style={[styles.input, { marginBottom: 0 }]} 
                      placeholder="VD: 3 sets / 12 reps" 
                      placeholderTextColor="#666"
                      value={ex.reps}
                      onChangeText={(v) => {
                        const nextW = {...workout};
                        nextW.rounds[rIdx].exercises[eIdx].reps = v;
                        setWorkout(nextW);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.miniLabel}>Thời lượng:</Text>
                    <TextInput 
                      style={[styles.input, { backgroundColor: '#333', marginBottom: 0 }]} 
                      value={ex.duration}
                      editable={false}
                    />
                  </View>
                </View>
                
                <View style={[styles.uploadArea, { marginTop: 15 }]}>
                  <TouchableOpacity 
                    style={styles.pickBtn} 
                    onPress={() => pickMedia(rIdx, eIdx)}
                    disabled={uploading === ex.id}
                  >
                    {uploading === ex.id ? (
                      <ActivityIndicator color="#E2F163" />
                    ) : (
                      <Text style={styles.pickBtnText}>
                        {ex.videoUrl ? '✅ Đã có Video' : '📁 Chọn Video/Ảnh'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {ex.videoUrl ? (
                    <Text style={styles.urlText} numberOfLines={1}>{ex.videoUrl}</Text>
                  ) : null}
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => addExercise(rIdx)}>
              <Text style={styles.addBtnText}>+ Thêm động tác</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addRoundBtn} onPress={addRound}>
          <Text style={styles.addRoundBtnText}>+ THÊM ROUND MỚI</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>LƯU BÀI TẬP</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 20 },
  header: { color: '#E2F163', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  section: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 15, marginBottom: 20 },
  sectionTitle: { color: '#B3A0FF', fontSize: 18, fontWeight: '700', marginBottom: 15 },
  roundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  roundNameInput: { color: '#B3A0FF', fontSize: 18, fontWeight: '700', flex: 1 },
  removeText: { color: '#FF6B6B', fontSize: 12, fontWeight: '600' },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  exSubRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  miniRemove: { padding: 5 },
  label: { color: '#fff', marginBottom: 10, fontSize: 14, fontWeight: '600' },
  miniLabel: { color: '#666', fontSize: 10, marginBottom: 5 },
  mainImageArea: { width: '100%', height: 150, borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  mainImageBtn: { width: '100%', height: '100%', position: 'relative' },
  mainImagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  mainImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, alignItems: 'center' },
  mainImageText: { color: '#E2F163', fontSize: 12, fontWeight: '600' },
  levelContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  levelPill: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#333', alignItems: 'center' },
  levelPillActive: { backgroundColor: '#E2F163' },
  levelText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  levelTextActive: { color: '#000' },
  exerciseRow: { padding: 12, backgroundColor: '#252525', borderRadius: 12, marginBottom: 15 },
  row: { flexDirection: 'row' },
  uploadArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickBtn: { backgroundColor: '#333', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#E2F163' },
  pickBtnText: { color: '#E2F163', fontSize: 13, fontWeight: '600' },
  urlText: { color: '#666', fontSize: 10, flex: 1 },
  addBtn: { alignSelf: 'center', marginTop: 10 },
  addBtnText: { color: '#E2F163', fontWeight: '600' },
  addRoundBtn: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#B3A0FF', borderStyle: 'dashed' },
  addRoundBtnText: { color: '#B3A0FF', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#E2F163', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
