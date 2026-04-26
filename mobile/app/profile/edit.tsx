import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRouter } from 'expo-router';
import { useSetupStore } from '../../store/setupStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data, updateData, submitSetup } = useSetupStore();

  const [fullName, setFullName] = useState(data.fullName || '');
  const [email, setEmail] = useState(data.email || '');
  const [mobile, setMobile] = useState(data.mobile || '');
  
  // Date of birth handling
  const [date, setDate] = useState(new Date(1995, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dob, setDob] = useState('01 / 01 / 1995');

  const [weight, setWeight] = useState(data.weight ? `${data.weight}` : '75');
  const [height, setHeight] = useState(data.height ? `${(data.height / 100).toFixed(2)}` : '1.65');
  const [loading, setLoading] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    // Format: DD / MM / YYYY
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    setDob(`${day} / ${month} / ${year}`);
  };

  const handleEditAvatar = () => {
    Alert.alert(
      'Edit Avatar',
      'Choose an option',
      [
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera roll permissions are needed!');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
              base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
              const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
              updateData({ avatarUrl: base64Uri });
              submitSetup(); 
            }
          }
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => {
            updateData({ avatarUrl: '' });
            submitSetup();
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
        }
      ]
    );
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Parse numeric values
      const parsedWeight = parseFloat(weight);
      // Assuming user enters height in meters (e.g. 1.65), store as cm internally if needed, or keep as meters.
      // We will store height in cm to match backend typical usage, or if backend expects cm:
      const parsedHeight = parseFloat(height) * 100;

      updateData({
        fullName,
        email,
        mobile,
        weight: isNaN(parsedWeight) ? data.weight : parsedWeight,
        height: isNaN(parsedHeight) ? data.height : parsedHeight,
      });

      await submitSetup();
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'User')}&background=random&size=200`;
  const avatarSource = data.avatarUrl ? { uri: data.avatarUrl } : { uri: defaultAvatar };

  const displayWeight = weight ? `${weight} Kg` : '75 Kg';
  const displayAge = data.age ? `${data.age}` : '28';
  const displayHeight = height ? `${height} M` : '1.65 M';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Top Banner */}
          <View style={styles.topBanner}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="caret-back" size={18} color={COLORS.yellow} />
              <Text style={styles.headerTitle}>My Profile</Text>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={avatarSource}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditAvatar}>
                  <Ionicons name="pencil" size={14} color="#232323" />
                </TouchableOpacity>
              </View>
              <Text style={styles.name}>{fullName || 'User Name'}</Text>
              <Text style={styles.email}>{email || 'user@example.com'}</Text>
              <Text style={styles.birthday}>
                <Text style={{ fontWeight: '600' }}>Birthday: </Text>
                April 1st
              </Text>
            </View>
          </View>

          {/* Stats Card - floats over the banner */}
          <View style={styles.statsCardContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{displayWeight}</Text>
                <Text style={styles.statLabel}>Weight</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{displayAge}</Text>
                <Text style={styles.statLabel}>Years Old</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{displayHeight}</Text>
                <Text style={styles.statLabel}>Height</Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                placeholder="+123 567 89000"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of birth</Text>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.inputText, !dob && { color: '#999' }]}>
                  {dob || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.purple} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.flexInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="75"
                  placeholderTextColor="#999"
                />
                <Text style={styles.unitText}>Kg</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.flexInput}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="1.65"
                  placeholderTextColor="#999"
                />
                <Text style={styles.unitText}>M</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.updateBtn, loading && { opacity: 0.7 }]} 
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.updateBtnText}>{loading ? 'Updating...' : 'Update Profile'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBanner: {
    backgroundColor: COLORS.purple,
    paddingTop: 10,
    paddingBottom: 70,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.yellow,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '300',
    marginBottom: 4,
  },
  birthday: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '300',
  },
  statsCardContainer: {
    alignItems: 'center',
    marginTop: -45,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#896CFE',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'League Spartan',
    fontWeight: '600',
    textAlign: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'League Spartan',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.purple,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'League Spartan',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    color: '#232323',
    fontFamily: 'League Spartan',
  },
  inputWithUnit: {
    backgroundColor: 'white',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexInput: {
    flex: 1,
    fontSize: 16,
    color: '#232323',
    fontFamily: 'League Spartan',
    height: '100%',
  },
  unitText: {
    fontSize: 16,
    color: '#232323',
    fontFamily: 'League Spartan',
    fontWeight: '600',
    marginLeft: 8,
  },
  updateBtn: {
    backgroundColor: COLORS.yellow,
    borderRadius: 100,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  updateBtnText: {
    color: '#232323',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
});
