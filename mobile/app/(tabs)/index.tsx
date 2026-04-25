import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRouter } from 'expo-router';
import { useSetupStore } from '../../store/setupStore';

// Local images from assets
const imgSquat = require('../../assets/woman-helping-man-gym (1) 2.png');
const imgStretching = require('../../assets/woman-helping-man-gym (1) 3.png');
const imgChallenge = require('../../assets/woman-helping-man-gym (1) 4.png');
const imgArticle1 = require('../../assets/woman-helping-man-gym (1) 5.png');
const imgArticle2 = require('../../assets/woman-helping-man-gym (1) 6.png');

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { data, loadSetupData } = useSetupStore();

  useEffect(() => {
    loadSetupData();
  }, []);

  const displayName = data.nickname || data.fullName || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {displayName}</Text>
            <Text style={styles.subGreeting}>It's time to challenge your limits.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={22} color="#896CFE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color="#896CFE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile' as any)}>
              <Ionicons name="person-outline" size={22} color="#896CFE" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categories}>
          <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => router.push('/(tabs)/workout')}
          >
            <Ionicons name="barbell" size={32} color={COLORS.accent} />
            <Text style={[styles.categoryText, { color: COLORS.accent }]}>Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem}>
            <Ionicons name="bar-chart-outline" size={32} color={COLORS.purple} />
            <Text style={styles.categoryText}>Progress{'\n'}Tracking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem}>
            <Ionicons name="nutrition-outline" size={32} color={COLORS.purple} />
            <Text style={styles.categoryText}>Nutrition</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem}>
            <Ionicons name="people-outline" size={32} color={COLORS.purple} />
            <Text style={styles.categoryText}>Community</Text>
          </TouchableOpacity>
        </View>

        {/* Recommendations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="caret-forward" size={12} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
        <View style={styles.horizontalList}>
          {/* Card 1 */}
          <View style={styles.card}>
            <Image source={imgSquat} style={styles.cardImage} />
            <TouchableOpacity style={styles.starIcon}>
              <Ionicons name="star" size={14} color={COLORS.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={11} color="white" />
            </TouchableOpacity>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Squat Exercise</Text>
              <View style={styles.cardStats}>
                <Ionicons name="time-outline" size={10} color="#896CFE" />
                <Text style={styles.cardStatText}>12 Minutes</Text>
                <Ionicons name="flame-outline" size={10} color="#896CFE" style={{ marginLeft: 6 }} />
                <Text style={styles.cardStatText}>120 Kcal</Text>
              </View>
            </View>
          </View>

          {/* Card 2 */}
          <View style={styles.card}>
            <Image source={imgStretching} style={styles.cardImage} />
            <TouchableOpacity style={styles.starIcon}>
              <Ionicons name="star-outline" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={11} color="white" />
            </TouchableOpacity>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Full Body Stretching</Text>
              <View style={styles.cardStats}>
                <Ionicons name="time-outline" size={10} color="#896CFE" />
                <Text style={styles.cardStatText}>12 Minutes</Text>
                <Ionicons name="flame-outline" size={10} color="#896CFE" style={{ marginLeft: 6 }} />
                <Text style={styles.cardStatText}>120 Kcal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeCardInner}>
            <View style={styles.challengeTextContainer}>
              <Text style={styles.challengeTitle}>Weekly{'\n'}Challenge</Text>
              <Text style={styles.challengeDesc}>Plank With Hip Twist</Text>
            </View>
            <Image source={imgChallenge} style={styles.challengeImage} />
          </View>
        </View>

        {/* Articles & Tips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Articles & Tips</Text>
        </View>
        <View style={styles.horizontalList}>
          <View style={styles.articleCard}>
            <View style={styles.articleImageWrap}>
              <Image source={imgArticle1} style={styles.articleImage} />
              <TouchableOpacity style={styles.articleStar}>
                <Ionicons name="star" size={12} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
            <Text style={styles.articleTitle}>Supplement Guide...</Text>
          </View>
          <View style={styles.articleCard}>
            <View style={styles.articleImageWrap}>
              <Image source={imgArticle2} style={styles.articleImage} />
              <TouchableOpacity style={styles.articleStar}>
                <Ionicons name="star-outline" size={12} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.articleTitle}>15 Quick & Effective Daily Routines...</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greeting: {
    color: '#896CFE',
    fontSize: 20,
    fontWeight: '700',
  },
  subGreeting: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 14,
  },
  iconButton: {
    padding: 4,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 28,
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryText: {
    color: COLORS.purple,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '500',
  },
  seeAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  horizontalList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 157,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  cardImage: {
    width: '100%',
    height: 92,
    resizeMode: 'cover',
  },
  starIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  playButton: {
    position: 'absolute',
    right: 8,
    top: 80,
    width: 23,
    height: 23,
    backgroundColor: '#896CFE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  cardContent: {
    padding: 10,
    paddingTop: 14,
  },
  cardTitle: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 6,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 3,
  },
  challengeCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: COLORS.purple,
    borderRadius: 20,
    overflow: 'hidden',
  },
  challengeCardInner: {
    flexDirection: 'row',
    height: 125,
  },
  challengeTextContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  challengeTitle: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 25,
  },
  challengeDesc: {
    color: 'white',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 8,
  },
  challengeImage: {
    width: 157,
    height: '100%',
    resizeMode: 'cover',
  },
  articleCard: {
    width: 157,
  },
  articleImageWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  articleImage: {
    width: '100%',
    height: 134,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  articleStar: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  articleTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '400',
  },
});
