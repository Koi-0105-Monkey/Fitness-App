import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function WelcomeSetupScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/beautiful-young-sporty-woman-training-workout-gym 4.png')} 
          style={styles.image}
          resizeMode="cover"
        />
        {/* Simple back arrow if needed, though image shows a tiny yellow triangle */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
           <View style={styles.triangle} />
        </TouchableOpacity>
      </View>

      {/* Main Text Section */}
      <View style={styles.textSection}>
        <Text style={styles.title}>
          Consistency Is{'\n'}The Key To Progress.{'\n'}Don't Give Up!
        </Text>
      </View>

      {/* Purple Info Section */}
      <View style={styles.purpleSection}>
        <Text style={styles.infoText}>
          Your fitness journey is a marathon, not a sprint. Every small step you take today leads to a stronger, healthier version of yourself tomorrow.
        </Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => router.push('/(setup)/gender' as any)}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232323', // Dark background from image
  },
  imageContainer: {
    flex: 5, // Takes up about half the screen
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 25,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#D0FD3E', // Yellow color from image
    transform: [{ rotate: '-90deg' }],
  },
  textSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323',
    paddingHorizontal: 20,
  },
  title: {
    color: '#D0FD3E', // High contrast yellow
    fontSize: 26,
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  purpleSection: {
    backgroundColor: '#B3A0FF', // Light purple color from image
    paddingVertical: 30,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#232323', // Dark text on purple
    fontSize: 13,
    fontFamily: 'League Spartan',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonSection: {
    flex: 2,
    backgroundColor: '#232323',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: '60%',
    height: 54,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
});
