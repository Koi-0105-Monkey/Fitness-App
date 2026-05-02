import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import {
  FEATURED,
  RECOMMENDED,
  FOR_YOU,
  BREAKFAST,
  LUNCH,
  DINNER,
  MainTab,
  MealIdeasTab,
  Recipe,
  PLAN_RESULT,
} from './data';

type MealPlanStep = 'step1' | 'step2' | 'loading' | 'result' | 'recipe';

const { width } = Dimensions.get('window');

// ─── Reusable Components ──────────────────────────────────────────────────────

const RecipeCard = ({ item, layout = 'vertical' }: { item: Recipe; layout?: 'vertical' | 'horizontal' }) => {
  const isHorizontal = layout === 'horizontal';

  if (isHorizontal) {
    return (
      <TouchableOpacity style={styles.hCard} activeOpacity={0.85}>
        <View style={styles.hCardText}>
          <Text style={styles.hCardTitle}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time" size={12} color="#212020" style={{ opacity: 0.8 }} />
            <Text style={styles.metaTextLight}>{item.time}</Text>
            <Ionicons name="flame" size={12} color="#212020" style={{ opacity: 0.8, marginLeft: 8 }} />
            <Text style={styles.metaTextLight}>{item.calories}</Text>
          </View>
        </View>
        <Image source={{ uri: item.image }} style={styles.hCardImage} />
        <TouchableOpacity style={styles.hCardStar}>
          <Ionicons name="star" size={16} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.vCard} activeOpacity={0.85}>
      <Image source={{ uri: item.image }} style={styles.vCardImage} />
      <TouchableOpacity style={styles.vCardStar}>
        <Ionicons name="star" size={16} color="white" />
      </TouchableOpacity>
      <View style={styles.vCardPlay}>
        <Ionicons name="play" size={14} color="white" />
      </View>
      <View style={styles.vCardContent}>
        <Text style={styles.vCardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time" size={12} color={COLORS.purple} />
          <Text style={styles.metaTextDark}>{item.time}</Text>
          <Ionicons name="flame" size={12} color={COLORS.purple} style={{ marginLeft: 8 }} />
          <Text style={styles.metaTextDark}>{item.calories}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NutritionScreen() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'main' | 'mealplans' | 'mealideas'>('main');
  const [mealIdeaTab, setMealIdeaTab] = useState<MealIdeasTab>('breakfast');
  
  // Meal Plan Flow State
  const [mealPlanStep, setMealPlanStep] = useState<MealPlanStep>('step1');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [dietPref, setDietPref] = useState('No preferences');
  const [allergies, setAllergies] = useState('No allergies');
  const [mealTypes, setMealTypes] = useState('Breakfast');
  
  const [calGoal, setCalGoal] = useState('Not sure/Don\'t have a goal');
  const [cookTime, setCookTime] = useState('15-30 minutes');
  const [servings, setServings] = useState('1');

  // Top header (Back, title, icons)
  const renderHeader = () => {
    const isFlow = activeView === 'mealplans';
    
    const handleBack = () => {
      if (isFlow) {
        if (mealPlanStep === 'step1') {
          setActiveView('main'); 
        } else if (mealPlanStep === 'step2') {
          setMealPlanStep('step1');
        } else if (mealPlanStep === 'result') {
          setMealPlanStep('step2');
        } else if (mealPlanStep === 'recipe') {
          setMealPlanStep('result');
        }
      } else if (activeView === 'mealideas') {
        setActiveView('main');
      } else {
        router.back();
      }
    };

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="caret-back" size={20} color={COLORS.yellow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isFlow ? 'Meal Plans' : 'Nutrition'}</Text>
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
    );
  };

  const renderTabs = () => (
    <View style={styles.mainTabs}>
      <TouchableOpacity
        style={[styles.mainTabBtn, activeView === 'mealplans' && styles.mainTabActive]}
        onPress={() => {
          setActiveView(activeView === 'mealplans' ? 'main' : 'mealplans');
          setMealPlanStep('step1');
        }}
      >
        <Text style={[styles.mainTabTxt, activeView === 'mealplans' && styles.mainTabTxtActive]}>
          Meal Plans
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.mainTabBtn, activeView === 'mealideas' && styles.mainTabActive]}
        onPress={() => setActiveView(activeView === 'mealideas' ? 'main' : 'mealideas')}
      >
        <Text style={[styles.mainTabTxt, activeView === 'mealideas' && styles.mainTabTxtActive]}>
          Meal Ideas
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeatured = (recipe: Recipe) => (
    <View style={styles.featuredSection}>
      {/* Background purple block */}
      <View style={styles.featuredBg} />
      
      <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
        <Image source={{ uri: recipe.image }} style={styles.featuredImage} />
        
        {/* Tag */}
        {recipe.tag && (
          <View style={styles.featuredTag}>
            <Text style={styles.featuredTagTxt}>{recipe.tag}</Text>
          </View>
        )}

        {/* Overlay info */}
        <View style={styles.featuredInfoOverlay}>
          <View style={{ flex: 1 }}>
            <Text style={styles.featuredTitle}>{recipe.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time" size={12} color="white" />
              <Text style={styles.metaTextWhite}>{recipe.time}</Text>
              <Ionicons name="flame" size={12} color="white" style={{ marginLeft: 12 }} />
              <Text style={styles.metaTextWhite}>{recipe.calories}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.featuredStar}>
            <Ionicons name="star" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const RadioOption = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity style={styles.radioOpt} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.radioCircle}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioTxt}>{label}</Text>
    </TouchableOpacity>
  );

  const RadioGroup = ({ title, subtitle, options, selectedValue, onSelect, twoCols = true }: any) => (
    <View style={styles.flowSection}>
      <Text style={styles.flowTitle}>{title}</Text>
      {subtitle && <Text style={styles.flowSubtitle}>{subtitle}</Text>}
      <View style={[styles.radioGrid, !twoCols && { flexDirection: 'column' }]}>
        {options.map((opt: string) => (
          <View key={opt} style={twoCols ? { width: '48%' } : { width: '100%', marginBottom: 12 }}>
            <RadioOption label={opt} selected={selectedValue === opt} onPress={() => onSelect(opt)} />
          </View>
        ))}
      </View>
    </View>
  );

  const handleCreatePlan = () => {
    setMealPlanStep('loading');
    setTimeout(() => {
      setMealPlanStep('result');
    }, 2000);
  };

  const renderMainPage = () => (
    <>
      {renderFeatured(FEATURED)}
      <View style={styles.contentPadding}>
        <Text style={styles.sectionTitle}>Recommended</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {RECOMMENDED.map((item) => (
            <RecipeCard key={item.id} item={item} layout="vertical" />
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recipes For You</Text>
        <View style={styles.vList}>
          {FOR_YOU.map((item) => (
            <RecipeCard key={item.id} item={item} layout="horizontal" />
          ))}
        </View>
      </View>
    </>
  );

  const renderMealPlansFlow = () => {
    if (mealPlanStep === 'step1') {
      return (
        <View style={styles.flowContainer}>
          <RadioGroup
            title="Dietary Preferences"
            subtitle="What are your dietary preferences?"
            options={['Vegetarian', 'Keto', 'Vegan', 'Paleo', 'Gluten-Free', 'No preferences']}
            selectedValue={dietPref}
            onSelect={setDietPref}
          />
          <RadioGroup
            title="Allergies"
            subtitle="Do you have any food allergies we should know about?"
            options={['Nuts', 'Eggs', 'Dairy', 'No allergies', 'Shellfish']}
            selectedValue={allergies}
            onSelect={setAllergies}
          />
          <RadioGroup
            title="Meal Types"
            subtitle="Which meals do you want to plan?"
            options={['Breakfast', 'Dinner', 'Lunch', 'Snacks']}
            selectedValue={mealTypes}
            onSelect={setMealTypes}
          />
          <TouchableOpacity style={styles.yellowBtn} onPress={() => setMealPlanStep('step2')}>
            <Text style={styles.yellowBtnTxt}>Next</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (mealPlanStep === 'step2') {
      return (
        <View style={styles.flowContainer}>
          <RadioGroup
            title="Caloric Goal"
            subtitle="What is your daily caloric intake goal?"
            options={['Less than 1500 calories', '1500-2000 calories', 'More than 2000 calories', 'Not sure/Don\'t have a goal']}
            selectedValue={calGoal}
            onSelect={setCalGoal}
            twoCols={false}
          />
          <RadioGroup
            title="Cooking Time Preference"
            subtitle="How much time are you willing to spend cooking each meal?"
            options={['Less than 15 minutes', '15-30 minutes', 'More than 30 minutes']}
            selectedValue={cookTime}
            onSelect={setCookTime}
            twoCols={false}
          />
          <RadioGroup
            title="Number Of Servings"
            subtitle="How many servings do you need per meal?"
            options={['1', '3-4', '2', 'More than 4']}
            selectedValue={servings}
            onSelect={setServings}
          />
          <TouchableOpacity style={styles.yellowBtn} onPress={handleCreatePlan}>
            <Text style={styles.yellowBtnTxt}>Create</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mealPlanStep === 'loading') {
      return (
        <View style={[styles.flowContainer, { alignItems: 'center', justifyContent: 'center', minHeight: 400 }]}>
          <View style={styles.loadingCircle}>
            <View style={styles.loadingDot} />
          </View>
          <Text style={styles.loadingTxt}>Creating A Plan For You</Text>
        </View>
      );
    }

    if (mealPlanStep === 'result') {
      return (
        <View style={styles.flowContainer}>
          <Text style={styles.flowTitle}>Breakfast Plan For You</Text>
          <Text style={[styles.flowSubtitle, { marginBottom: 20 }]}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.</Text>
          
          <View style={{ gap: 16 }}>
            {PLAN_RESULT.map((item, index) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Radio button beside recipe card */}
                <TouchableOpacity style={{ marginRight: 12 }}>
                  <View style={[styles.radioCircle, index === 2 && styles.radioCircleActive]}>
                    {index === 2 && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <RecipeCard item={item} layout="horizontal" />
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={[styles.yellowBtn, { marginTop: 30 }]} onPress={() => {
            setSelectedRecipe(PLAN_RESULT[2]);
            setMealPlanStep('recipe');
          }}>
            <Text style={styles.yellowBtnTxt}>See Recipe</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mealPlanStep === 'recipe' && selectedRecipe) {
      return (
        <View style={styles.flowContainer}>
          <Text style={[styles.flowTitle, { fontSize: 22 }]}>{selectedRecipe.title}</Text>
          <View style={[styles.metaRow, { marginBottom: 16 }]}>
            <Ionicons name="time" size={14} color={COLORS.purple} />
            <Text style={[styles.metaTextDark, { fontSize: 13 }]}>{selectedRecipe.time}</Text>
            <Ionicons name="flame" size={14} color={COLORS.purple} style={{ marginLeft: 12 }} />
            <Text style={[styles.metaTextDark, { fontSize: 13 }]}>{selectedRecipe.calories}</Text>
          </View>
          
          <Image source={{ uri: selectedRecipe.image }} style={styles.recipeImage} />
          
          <Text style={styles.recipeHeading}>Ingredients</Text>
          {selectedRecipe.ingredients?.map((ing, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletTxt}>{ing}</Text>
            </View>
          ))}
          
          <Text style={styles.recipeHeading}>Preparation</Text>
          <Text style={styles.recipeText}>{selectedRecipe.preparation}</Text>
          
          <TouchableOpacity style={[styles.yellowBtn, { marginTop: 30 }]}>
            <Text style={styles.yellowBtnTxt}>Save Recipes</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderMealIdeas = () => {
    // Get correct data based on sub-tab
    let ideaData = BREAKFAST;
    if (mealIdeaTab === 'lunch') ideaData = LUNCH;
    if (mealIdeaTab === 'dinner') ideaData = DINNER;

    const featuredIdea = ideaData[0] || FEATURED;
    const recommendedIdeas = ideaData.slice(1, 3);
    const forYouIdeas = ideaData.slice(3) || FOR_YOU;

    return (
      <>
        {/* Sub tabs */}
        <View style={styles.subTabs}>
          {['breakfast', 'lunch', 'dinner'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.subTabBtn, mealIdeaTab === tab && styles.subTabActive]}
              onPress={() => setMealIdeaTab(tab as MealIdeasTab)}
            >
              <Text style={[styles.subTabTxt, mealIdeaTab === tab && styles.subTabTxtActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderFeatured(featuredIdea)}
        
        <View style={styles.contentPadding}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {recommendedIdeas.map((item) => (
              <RecipeCard key={item.id} item={item} layout="vertical" />
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recipes For You</Text>
          <View style={styles.vList}>
            {(forYouIdeas.length > 0 ? forYouIdeas : FOR_YOU).map((item) => (
              <RecipeCard key={item.id} item={item} layout="horizontal" />
            ))}
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      {activeView !== 'mealplans' && renderTabs()}
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeView === 'main' && renderMainPage()}
        {activeView === 'mealplans' && renderMealPlansFlow()}
        {activeView === 'mealideas' && renderMealIdeas()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: {
    flex: 1,
    color: '#B3A0FF', // matches screenshot purple title
    fontSize: 22,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },

  // Tabs
  mainTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  mainTabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: 'white', // inactive is white
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabActive: {
    backgroundColor: '#E2F163', // active is yellow
  },
  mainTabTxt: {
    color: '#B3A0FF', // inactive text is purple
    fontSize: 15,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  mainTabTxtActive: {
    color: '#212020', // active text is dark
  },

  // Featured Section
  featuredSection: {
    position: 'relative',
    paddingTop: 10,
    paddingBottom: 20,
  },
  featuredBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#B3A0FF',
  },
  featuredCard: {
    marginHorizontal: 20,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#333',
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E2F163',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  featuredTagTxt: {
    color: '#212020',
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  featuredInfoOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(33,32,32,0.85)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredTitle: {
    color: '#E2F163',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredStar: {
    padding: 6,
  },

  // Common Typography
  contentPadding: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    color: '#E2F163',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTextWhite: { color: 'white', fontSize: 11, fontFamily: 'League Spartan' },
  metaTextLight: { color: '#212020', opacity: 0.8, fontSize: 11, fontFamily: 'League Spartan' },
  metaTextDark: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'League Spartan' },

  // Vertical Cards (Recommended)
  hScroll: { gap: 16 },
  vCard: {
    width: 150,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  vCardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  vCardStar: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  vCardPlay: {
    position: 'absolute',
    top: 80, // slightly overlapping image and content
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#B3A0FF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  vCardContent: {
    padding: 12,
    paddingTop: 16,
  },
  vCardTitle: {
    color: '#E2F163',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginBottom: 6,
  },

  // Horizontal Cards (Recipes For You)
  vList: { gap: 16 },
  hCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    height: 100,
    overflow: 'hidden',
  },
  hCardText: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  hCardTitle: {
    color: '#212020',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  hCardImage: {
    width: 130,
    height: '100%',
    resizeMode: 'cover',
  },
  hCardStar: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  // Sub Tabs (Breakfast, Lunch, Dinner)
  subTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  subTabActive: {
    backgroundColor: '#E2F163',
  },
  subTabTxt: {
    color: '#B3A0FF',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  subTabTxtActive: {
    color: '#212020',
  },

  // Flow / Wizard Styles
  flowContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  flowSection: {
    marginBottom: 24,
  },
  flowTitle: {
    color: '#E2F163',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginBottom: 6,
  },
  flowSubtitle: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'League Spartan',
    marginBottom: 16,
    opacity: 0.9,
  },
  radioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  radioOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B3A0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: '#E2F163',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2F163',
  },
  radioTxt: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'League Spartan',
  },
  yellowBtn: {
    backgroundColor: '#E2F163',
    height: 50,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  yellowBtnTxt: {
    color: '#212020',
    fontSize: 18,
    fontFamily: 'League Spartan',
    fontWeight: '600',
  },

  // Loading
  loadingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    borderColor: '#B3A0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    position: 'absolute',
    left: 25,
    top: 35,
  },
  loadingTxt: {
    color: '#E2F163',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },

  // Recipe Details
  recipeImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    resizeMode: 'cover',
    marginBottom: 24,
  },
  recipeHeading: {
    color: '#E2F163',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 12,
    marginLeft: 8,
  },
  bulletTxt: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'League Spartan',
    opacity: 0.9,
  },
  recipeText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'League Spartan',
    opacity: 0.9,
    lineHeight: 22,
  },
});
