import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';

interface FeaturedCardProps {
  property: any;
  onPress: () => void;
  onSave: () => void;
}

export default function FeaturedCard({ property, onPress, onSave }: FeaturedCardProps) {
  const formatPrice = (price: number, unit: string) => {
    if (unit === 'Crore') return `₹${price} Cr`;
    if (price >= 100) return `₹${(price / 100).toFixed(1)} Cr`;
    return `₹${price} L`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <Image
        source={{ uri: property.images?.[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.gradient}
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={{ fontSize: 18 }}>{property.isSaved ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      {/* Verified */}
      {property.isVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(property.price, property.priceUnit)}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {property.rating?.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.location} numberOfLines={1}>
          📍 {property.location?.area}, {property.location?.city}
        </Text>
        <View style={styles.specs}>
          <Text style={styles.spec}>{property.bhk} BHK</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.spec}>{property.sqft?.toLocaleString()} sqft</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.spec}>{property.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    ...SHADOWS.medium,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' },
  saveBtn: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(16,185,129,0.9)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  content: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: '800', color: '#fff' },
  ratingBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  title: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
  location: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  specs: { flexDirection: 'row', alignItems: 'center' },
  spec: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  dot: { color: 'rgba(255,255,255,0.5)', marginHorizontal: 6, fontSize: 10 },
});
