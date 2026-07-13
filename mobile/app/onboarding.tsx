import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Your Dream Home',
    subtitle: 'Discover thousands of verified properties from trusted builders across India',
    emoji: '🏠',
    gradient: ['#4169E1', '#2D4FC7'] as [string, string],
    accent: '#6B8EFF',
  },
  {
    id: '2',
    title: 'Verified Builder Network',
    subtitle: 'Connect directly with certified builders. No middlemen, no hidden charges',
    emoji: '✅',
    gradient: ['#2D4FC7', '#1A3AB5'] as [string, string],
    accent: '#4169E1',
  },
  {
    id: '3',
    title: 'AI-Powered Search',
    subtitle: 'Just tell our AI what you need, and it finds your perfect property in seconds',
    emoji: '🤖',
    gradient: ['#1A3AB5', '#0F2980'] as [string, string],
    accent: '#4169E1',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => handleGetStarted();

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            {/* Top decoration circles */}
            <View style={[styles.circle, styles.circleTopRight]} />
            <View style={[styles.circle, styles.circleTopLeft]} />

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              {/* Feature chips */}
              <View style={styles.chips}>
                {item.id === '1' && (
                  <>
                    <View style={styles.chip}><Text style={styles.chipText}>🏙️ Mumbai</Text></View>
                    <View style={styles.chip}><Text style={styles.chipText}>🌆 Bangalore</Text></View>
                    <View style={styles.chip}><Text style={styles.chipText}>🏛️ Delhi</Text></View>
                  </>
                )}
                {item.id === '2' && (
                  <>
                    <View style={styles.chip}><Text style={styles.chipText}>🔒 Secure</Text></View>
                    <View style={styles.chip}><Text style={styles.chipText}>📋 Legal</Text></View>
                    <View style={styles.chip}><Text style={styles.chipText}>⭐ Rated</Text></View>
                  </>
                )}
                {item.id === '3' && (
                  <>
                    <View style={styles.chip}><Text style={styles.chipText}>💬 Chat</Text></View>
                    <View style={styles.chip}><Text style={styles.chipText}>🎯 Smart</Text></View>
                    <View style={styles.chip}><Text style={styles.chipText}>⚡ Instant</Text></View>
                  </>
                )}
              </View>
            </View>

            {/* Bottom circles */}
            <View style={[styles.circle, styles.circleBottomLeft]} />
          </LinearGradient>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {currentIndex < slides.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.nextGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextText}>Next →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleGetStarted} style={styles.getStartedBtn}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.getStartedGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.getStartedText}>Get Started 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: { width, height, position: 'relative', justifyContent: 'center' },
  circle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circleTopRight: { top: -60, right: -60, width: 240, height: 240, borderRadius: 120 },
  circleTopLeft: { top: 80, left: -80 },
  circleBottomLeft: { bottom: -60, left: -40, width: 160, height: 160, borderRadius: 80 },
  content: { paddingHorizontal: 32, alignItems: 'center' },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emoji: { fontSize: 60 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  buttons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  skipText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '500' },
  nextBtn: { borderRadius: 16, overflow: 'hidden' },
  nextGradient: { paddingHorizontal: 28, paddingVertical: 14 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  getStartedBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  getStartedGradient: { paddingVertical: 16, alignItems: 'center' },
  getStartedText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
