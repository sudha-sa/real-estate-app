import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Share,
  Animated,
  Linking,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePropertyStore } from '../../stores/propertyStore';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.45;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonBox = ({ style }: { style?: any }) => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[{ backgroundColor: '#DDE3FF', borderRadius: 10 }, style, { opacity: pulse }]} />
  );
};

const PropertySkeleton = () => (
  <View style={{ flex: 1, backgroundColor: COLORS.background }}>
    <SkeletonBox style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }} />
    <View style={{ padding: 20, gap: 12 }}>
      <SkeletonBox style={{ height: 28, width: '70%' }} />
      <SkeletonBox style={{ height: 18, width: '50%' }} />
      <SkeletonBox style={{ height: 22, width: '40%' }} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[1, 2, 3, 4].map(i => <SkeletonBox key={i} style={{ height: 60, flex: 1, borderRadius: 12 }} />)}
      </View>
      <SkeletonBox style={{ height: 80, borderRadius: 12 }} />
    </View>
  </View>
);

// ─── Amenity Icon Map ─────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, string> = {
  'Gym': '🏋️', 'Swimming Pool': '🏊', 'Clubhouse': '🏛️', 'Garden': '🌳',
  'Parking': '🅿️', 'Security': '🔒', 'Power Backup': '⚡', 'Elevator': '🛗',
  'CCTV': '📷', 'Children Play Area': '🛝', 'Jogging Track': '🏃', 'Spa': '💆',
  'Library': '📚', 'Tennis Court': '🎾', 'Basketball Court': '🏀',
  'Intercom': '📞', 'Visitor Parking': '🚗', 'Wi-Fi': '📶',
};
const amenityIcon = (name: string) => AMENITY_ICONS[name] || '✨';

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedProperty, isLoading, fetchPropertyById, toggleSave } = usePropertyStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveScale = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) fetchPropertyById(id);
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out this property: ${selectedProperty?.title}` });
    } catch (_) {}
  };

  const handleToggleSave = async () => {
    if (!selectedProperty) return;
    setSaving(true);
    Animated.sequence([
      Animated.spring(saveScale, { toValue: 1.35, useNativeDriver: true }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    try {
      await toggleSave(selectedProperty._id, selectedProperty.isSaved);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !selectedProperty) return <PropertySkeleton />;

  const property = selectedProperty;
  const images = property.images?.length > 0 ? property.images : [FALLBACK_IMAGE];
  const progress = property.constructionProgress?.completionPercent ?? 0;

  const formatPrice = (price: number, unit: string) => {
    if (unit === 'Cr') return `₹${price} Cr`;
    if (unit === 'L') return `₹${price} L`;
    return `₹${(price / 100000).toFixed(1)} L`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Hero Carousel ── */}
        <View style={styles.heroContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item || FALLBACK_IMAGE }}
                style={styles.heroImage}
                defaultSource={{ uri: FALLBACK_IMAGE }}
              />
            )}
          />
          {/* Gradient overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.3)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.navIcon}>←</Text>
          </TouchableOpacity>
          {/* Share button */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            <Text style={styles.navIcon}>⎙</Text>
          </TouchableOpacity>
          {/* Dot indicators */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Image counter badge */}
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{activeIndex + 1}/{images.length}</Text>
          </View>
        </View>

        {/* ── Content Card ── */}
        <View style={styles.card}>
          {/* Price + Title */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(property.price, property.priceUnit)}</Text>
            {property.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>⭐ Featured</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>
              {property.location?.area}, {property.location?.city}, {property.location?.state}
            </Text>
          </View>

          {/* Verified Badge */}
          {property.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✅</Text>
              <Text style={styles.verifiedText}>Verified Builder</Text>
            </View>
          )}

          {/* ── Specs Row ── */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Text style={styles.specEmoji}>🛏️</Text>
              <Text style={styles.specValue}>{property.bhk} BHK</Text>
              <Text style={styles.specLabel}>Bedrooms</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Text style={styles.specEmoji}>📐</Text>
              <Text style={styles.specValue}>{property.sqft?.toLocaleString()}</Text>
              <Text style={styles.specLabel}>Sq. Ft.</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Text style={styles.specEmoji}>🏠</Text>
              <Text style={styles.specValue}>{property.type}</Text>
              <Text style={styles.specLabel}>Type</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Text style={styles.specEmoji}>🔑</Text>
              <Text style={styles.specValue} numberOfLines={1}>{property.status?.replace('Under ', '')}</Text>
              <Text style={styles.specLabel}>Status</Text>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* ── Description ── */}
          <Text style={styles.sectionTitle}>About Property</Text>
          <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
            {property.description}
          </Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
            <Text style={styles.readMore}>{expanded ? 'Read less ▲' : 'Read more ▼'}</Text>
          </TouchableOpacity>

          <View style={styles.sectionDivider} />

          {/* ── Amenities ── */}
          {property.amenities?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((a, i) => (
                  <View key={i} style={styles.amenityPill}>
                    <Text style={styles.amenityEmoji}>{amenityIcon(a)}</Text>
                    <Text style={styles.amenityLabel}>{a}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.sectionDivider} />
            </>
          )}

          {/* ── Construction Progress ── */}
          <Text style={styles.sectionTitle}>Construction Progress</Text>
          <View style={styles.constructionCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Completion</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight || '#6B8EFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` as any }]}
              />
            </View>
            <TouchableOpacity
              style={styles.constructionBtn}
              activeOpacity={0.85}
              onPress={() => router.push(`/property/construction/${id}`)}
            >
              <LinearGradient
                colors={[COLORS.primary, '#6B8EFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.constructionBtnGrad}
              >
                <Text style={styles.constructionBtnText}>View Construction Details →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionDivider} />

          {/* ── Builder Info ── */}
          <Text style={styles.sectionTitle}>Builder Information</Text>
          <View style={styles.builderCard}>
            <View style={styles.builderTop}>
              <View style={styles.builderAvatar}>
                <Text style={styles.builderAvatarText}>
                  {property.builder?.name?.charAt(0) ?? 'B'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.builderName}>{property.builder?.name}</Text>
                <View style={styles.builderMeta}>
                  <Text style={styles.builderRating}>⭐ {property.builder?.rating ?? 4.5}</Text>
                  <Text style={styles.builderDot}>•</Text>
                  <Text style={styles.builderExp}>{property.builder?.experience} exp</Text>
                </View>
              </View>
            </View>
            <View style={styles.builderActions}>
              <TouchableOpacity
                style={[styles.builderBtn, styles.builderBtnCall]}
                onPress={() => Linking.openURL(`tel:${property.builder?.phone}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.builderBtnIcon}>📞</Text>
                <Text style={styles.builderBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.builderBtn, styles.builderBtnWa]}
                onPress={() => Linking.openURL(`https://wa.me/${property.builder?.phone?.replace(/\D/g, '')}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.builderBtnIcon}>💬</Text>
                <Text style={styles.builderBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.builderBtn, styles.builderBtnEmail]}
                onPress={() => Linking.openURL(`mailto:${property.builder?.email}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.builderBtnIcon}>✉️</Text>
                <Text style={styles.builderBtnText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Actions ── */}
      <View style={styles.bottomBar}>
        <Animated.View style={{ transform: [{ scale: saveScale }] }}>
          <TouchableOpacity
            style={[styles.saveBtn, property.isSaved && styles.saveBtnActive]}
            onPress={handleToggleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveIcon, property.isSaved && styles.saveIconActive]}>
              {property.isSaved ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity
          style={styles.visitBtn}
          onPress={() => router.push(`/property/book-visit/${id}`)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, '#6B8EFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.visitBtnGrad}
          >
            <Text style={styles.visitBtnText}>🗓 Schedule a Visit</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 0 },

  // Hero
  heroContainer: { width: SCREEN_WIDTH, height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width: SCREEN_WIDTH, height: HERO_HEIGHT, resizeMode: 'cover' },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.medium,
  },
  shareBtn: {
    position: 'absolute', top: 52, right: 16,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.medium,
  },
  navIcon: { fontSize: 18, color: COLORS.text },
  dotsRow: {
    position: 'absolute', bottom: 18,
    alignSelf: 'center', flexDirection: 'row', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 20, backgroundColor: '#fff' },
  counterBadge: {
    position: 'absolute', bottom: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 20, paddingTop: 24,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 28, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.5 },
  featuredBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  featuredText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 6, lineHeight: 26 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  locationIcon: { fontSize: 14 },
  locationText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },

  // Verified
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.successBg || '#D1FAE5',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    alignSelf: 'flex-start', marginTop: 14,
  },
  verifiedIcon: { fontSize: 14 },
  verifiedText: { fontSize: 13, fontWeight: '700', color: COLORS.success },

  // Specs
  specsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 20, padding: 16, marginTop: 20,
    ...SHADOWS.small,
  },
  specItem: { flex: 1, alignItems: 'center', gap: 4 },
  specEmoji: { fontSize: 22 },
  specValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  specLabel: { fontSize: 11, color: COLORS.textSecondary },
  specDivider: { width: 1, height: 40, backgroundColor: COLORS.border || '#E8ECFF' },

  sectionDivider: { height: 1, backgroundColor: COLORS.border || '#E8ECFF', marginVertical: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 14 },

  // Description
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  readMore: { color: COLORS.primary, fontWeight: '700', marginTop: 8, fontSize: 14 },

  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: COLORS.primaryBg || '#EEF2FF',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: COLORS.border || '#E8ECFF',
  },
  amenityEmoji: { fontSize: 16 },
  amenityLabel: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Construction
  constructionCard: {
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 20, padding: 18, ...SHADOWS.small,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  progressPercent: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  progressTrack: {
    height: 10, backgroundColor: COLORS.border || '#E8ECFF',
    borderRadius: 5, overflow: 'hidden', marginBottom: 18,
  },
  progressFill: { height: 10, borderRadius: 5 },
  constructionBtn: { borderRadius: 14, overflow: 'hidden' },
  constructionBtnGrad: { paddingVertical: 13, alignItems: 'center' },
  constructionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Builder
  builderCard: {
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 20, padding: 18, ...SHADOWS.small,
  },
  builderTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  builderAvatar: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  builderAvatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  builderName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  builderMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  builderRating: { fontSize: 13, color: COLORS.textSecondary },
  builderDot: { fontSize: 13, color: COLORS.textSecondary },
  builderExp: { fontSize: 13, color: COLORS.textSecondary },
  builderActions: { flexDirection: 'row', gap: 10 },
  builderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: 11,
    borderRadius: 14, borderWidth: 1.5,
  },
  builderBtnCall: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBg || '#EEF2FF' },
  builderBtnWa: { borderColor: '#25D366', backgroundColor: '#F0FFF4' },
  builderBtnEmail: { borderColor: COLORS.textSecondary, backgroundColor: COLORS.background },
  builderBtnIcon: { fontSize: 16 },
  builderBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white || '#fff',
    paddingHorizontal: 20, paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: COLORS.border || '#E8ECFF',
    ...SHADOWS.large,
  },
  saveBtn: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5, borderColor: COLORS.border || '#E8ECFF',
  },
  saveBtnActive: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
  saveIcon: { fontSize: 22 },
  saveIconActive: {},
  visitBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  visitBtnGrad: { paddingVertical: 15, alignItems: 'center' },
  visitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
});
