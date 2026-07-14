import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, TextInput, RefreshControl, Animated, Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import PropertyCard from '../../components/property/PropertyCard';
import FeaturedCard from '../../components/property/FeaturedCard';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const cities = ['All', 'Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad'];

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { properties, featuredProperties, isLoading, fetchProperties, fetchFeatured, toggleSave } = usePropertyStore();
  const [selectedCity, setSelectedCity] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (city?: string) => {
    const params: any = {};
    if (city && city !== 'All') params.city = city;
    await Promise.all([fetchProperties(params), fetchFeatured()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(selectedCity !== 'All' ? selectedCity : undefined);
    setRefreshing(false);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    loadData(city !== 'All' ? city : undefined);
  };

  const handleSave = async (id: string, isSaved: boolean) => {
    try {
      await toggleSave(id, isSaved);
      Toast.show({
        type: 'success',
        text1: isSaved ? 'Removed from Saved' : 'Property Saved! ❤️',
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Please login to save properties' });
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Sticky header bg on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Hero Header */}
        <LinearGradient colors={['#4169E1', '#2D4FC7']} style={styles.heroHeader}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>Good {getGreeting()}, 👋</Text>
              <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTagline}>Find Your Perfect{'\n'}Dream Property</Text>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/tabs/explore')}
            activeOpacity={0.9}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search properties, locations...</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* City Filter */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => handleCitySelect(city)}
                style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
              >
                <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Section */}
        {featuredProperties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ Featured Properties</Text>
              <TouchableOpacity onPress={() => router.push('/tabs/explore')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredProperties}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
              renderItem={({ item }) => (
                <FeaturedCard
                  property={item}
                  onPress={() => router.push(`/property/${item._id}`)}
                  onSave={() => handleSave(item._id, item.isSaved)}
                />
              )}
            />
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Properties', value: '2,500+', icon: '🏠' },
            { label: 'Cities', value: '15+', icon: '🏙️' },
            { label: 'Builders', value: '200+', icon: '🏗️' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Property Feed */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏘️ All Properties</Text>
            <Text style={styles.countText}>{properties.length} found</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeleton} />
              ))}
            </View>
          ) : properties.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏚️</Text>
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptySubtitle}>Try a different city filter</Text>
            </View>
          ) : (
            properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onPress={() => router.push(`/property/${property._id}`)}
                onSave={() => handleSave(property._id, property.isSaved)}
              />
            ))
          )}
        </View>
      </Animated.ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.aiButton}
        onPress={() => router.push('/ai-assistant')}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#4169E1', '#2D4FC7']} style={styles.aiGradient}>
          <Text style={styles.aiIcon}>🤖</Text>
          <Text style={styles.aiText}>AI</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 90,
    backgroundColor: '#fff', zIndex: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  heroHeader: {
    paddingTop: 56, paddingBottom: 32, paddingHorizontal: 20,
    position: 'relative', overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -60,
  },
  heroCircle2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: 0, left: -50,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  userName: { fontSize: 22, color: '#fff', fontWeight: '800' },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
  },
  notifIcon: { fontSize: 20 },
  heroTagline: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 20, lineHeight: 34 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    ...SHADOWS.medium,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchPlaceholder: { fontSize: 14, color: COLORS.textLight, flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  cityScroll: { paddingBottom: 4, gap: 8 },
  cityChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border,
    marginRight: 8,
  },
  cityChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cityChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  cityChipTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  countText: { fontSize: 13, color: COLORS.textSecondary },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 20,
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8,
    ...SHADOWS.small,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  loadingContainer: { gap: 12 },
  skeleton: {
    height: 220, backgroundColor: '#E8ECFF', borderRadius: 16,
    marginBottom: 4,
  },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
  aiButton: {
    position: 'absolute', bottom: 88, right: 20,
    borderRadius: 30, ...SHADOWS.large, overflow: 'hidden',
  },
  aiGradient: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  aiIcon: { fontSize: 22 },
  aiText: { fontSize: 9, color: '#fff', fontWeight: '700' },
});
