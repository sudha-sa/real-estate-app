import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: any;
  onPress: () => void;
  onSave: () => void;
}

export default function PropertyCard({ property, onPress, onSave }: PropertyCardProps) {
  const formatPrice = (price: number, unit: string) => {
    if (unit === 'Crore') return `₹${price} Cr`;
    if (price >= 100) return `₹${(price / 100).toFixed(1)} Cr`;
    return `₹${price} L`;
  };

  const statusColor = property.status === 'Ready to Move'
    ? COLORS.success
    : property.status === 'New Launch'
    ? COLORS.warning
    : COLORS.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{property.status}</Text>
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveIcon}>{property.isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Verified badge */}
        {property.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}

        {/* Price on image */}
        <View style={styles.priceOnImage}>
          <Text style={styles.priceText}>{formatPrice(property.price, property.priceUnit)}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.location} numberOfLines={1}>
          📍 {property.location?.area}, {property.location?.city}
        </Text>

        {/* Specs row */}
        <View style={styles.specs}>
          <View style={styles.spec}>
            <Text style={styles.specIcon}>🛏️</Text>
            <Text style={styles.specText}>{property.bhk} BHK</Text>
          </View>
          <View style={styles.specDot} />
          <View style={styles.spec}>
            <Text style={styles.specIcon}>📐</Text>
            <Text style={styles.specText}>{property.sqft?.toLocaleString()} sqft</Text>
          </View>
          <View style={styles.specDot} />
          <View style={styles.spec}>
            <Text style={styles.specIcon}>🏗️</Text>
            <Text style={styles.specText}>{property.type}</Text>
          </View>
        </View>

        {/* Builder & Rating */}
        <View style={styles.footer}>
          <View style={styles.builderRow}>
            <View style={styles.builderAvatar}>
              <Text style={styles.builderInitial}>{property.builder?.name?.[0] || 'B'}</Text>
            </View>
            <Text style={styles.builderName} numberOfLines={1}>{property.builder?.name}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{property.rating?.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  imageContainer: { position: 'relative', height: 200 },
  image: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  statusBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  saveBtn: {
    position: 'absolute', top: 10, right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20,
    width: 36, height: 36, justifyContent: 'center', alignItems: 'center',
  },
  saveIcon: { fontSize: 18 },
  verifiedBadge: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: 'rgba(16,185,129,0.9)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  priceOnImage: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  priceText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  info: { padding: 14 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  location: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
  specs: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specIcon: { fontSize: 13 },
  specText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  specDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.border, marginHorizontal: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  builderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  builderAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  builderInitial: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  builderName: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: 12 },
  rating: { fontSize: 13, fontWeight: '700', color: COLORS.text },
});
