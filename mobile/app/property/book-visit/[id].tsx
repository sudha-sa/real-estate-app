import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePropertyStore } from '../../../stores/propertyStore';
import useAuthStore from '../../../stores/authStore';
import api from '../../../services/api';
import { ENDPOINTS, TIME_SLOTS } from '../../../constants/api';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getNext14Days = () => {
  const days: { date: Date; label: string; day: string; month: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      label: String(d.getDate()).padStart(2, '0'),
      day: DAY_NAMES[d.getDay()],
      month: MONTH_NAMES[d.getMonth()],
    });
  }
  return days;
};

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ─── Success Screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({
  property,
  date,
  timeSlot,
  onBack,
}: {
  property: any;
  date: Date;
  timeSlot: string;
  onBack: () => void;
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={successStyles.container}>
      <LinearGradient colors={[COLORS.primary, '#6B8EFF', '#A78BFA']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[successStyles.iconWrap, { transform: [{ scale }] }]}>
        <View style={successStyles.iconCircle}>
          <Text style={successStyles.iconEmoji}>✅</Text>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity, transform: [{ translateY: slideY }], alignItems: 'center', paddingHorizontal: 32 }}>
        <Text style={successStyles.title}>Visit Confirmed!</Text>
        <Text style={successStyles.subtitle}>Your site visit has been scheduled successfully.</Text>

        <View style={successStyles.detailsCard}>
          <Text style={successStyles.detailTitle}>📍 {property?.title}</Text>
          <Text style={successStyles.detailSub}>{property?.location?.area}, {property?.location?.city}</Text>
          <View style={successStyles.detailRow}>
            <View style={successStyles.detailChip}>
              <Text style={successStyles.detailChipLabel}>📅 Date</Text>
              <Text style={successStyles.detailChipValue}>
                {DAY_NAMES[date.getDay()]}, {date.getDate()} {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
              </Text>
            </View>
            <View style={successStyles.detailChip}>
              <Text style={successStyles.detailChipLabel}>🕐 Time</Text>
              <Text style={successStyles.detailChipValue}>{timeSlot}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={successStyles.backBtn} onPress={onBack} activeOpacity={0.85}>
          <Text style={successStyles.backBtnText}>← Back to Property</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BookVisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedProperty, fetchPropertyById } = usePropertyStore();
  const { user } = useAuthStore();

  const days = getNext14Days();
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState(user?.name ?? '');
  const [visitorPhone, setVisitorPhone] = useState(user?.phone ?? '');
  const [visitorEmail, setVisitorEmail] = useState(user?.email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id && !selectedProperty) fetchPropertyById(id);
  }, [id]);

  const handleSubmit = async () => {
    if (!selectedSlot) {
      Alert.alert('Select Time Slot', 'Please choose a preferred time slot.');
      return;
    }
    if (!visitorName.trim() || !visitorPhone.trim() || !visitorEmail.trim()) {
      Alert.alert('Missing Details', 'Please fill in all visitor details.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.VISITS, {
        propertyId: id,
        date: formatDate(selectedDay.date),
        timeSlot: selectedSlot,
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        visitorEmail: visitorEmail.trim(),
      });
      setSuccess(true);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not book visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const property = selectedProperty;

  if (success && property) {
    return (
      <SuccessScreen
        property={property}
        date={selectedDay.date}
        timeSlot={selectedSlot ?? ''}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Header ── */}
      <LinearGradient
        colors={[COLORS.primary, '#6B8EFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.8}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Schedule Site Visit</Text>
          <Text style={styles.headerSub}>Book a free visit at your convenience</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ── Property Mini Card ── */}
          {property && (
            <View style={styles.propertyCard}>
              <Image
                source={{ uri: property.images?.[0] || FALLBACK_IMAGE }}
                style={styles.propertyCardImage}
              />
              <View style={styles.propertyCardInfo}>
                <Text style={styles.propertyCardTitle} numberOfLines={2}>{property.title}</Text>
                <Text style={styles.propertyCardLocation}>
                  📍 {property.location?.area}, {property.location?.city}
                </Text>
                <Text style={styles.propertyCardPrice}>
                  ₹{property.price} {property.priceUnit}
                </Text>
              </View>
            </View>
          )}

          {/* ── Date Picker ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📅  Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
              {days.map((d, i) => {
                const isSelected = d.date.toDateString() === selectedDay.date.toDateString();
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDay(d)}
                    activeOpacity={0.8}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  >
                    {isSelected ? (
                      <LinearGradient colors={[COLORS.primary, '#6B8EFF']} style={styles.dateChipGrad}>
                        <Text style={[styles.dateChipDay, { color: '#fff' }]}>{d.day}</Text>
                        <Text style={[styles.dateChipNum, { color: '#fff' }]}>{d.label}</Text>
                        <Text style={[styles.dateChipMonth, { color: 'rgba(255,255,255,0.8)' }]}>{d.month}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.dateChipInner}>
                        <Text style={styles.dateChipDay}>{d.day}</Text>
                        <Text style={styles.dateChipNum}>{d.label}</Text>
                        <Text style={styles.dateChipMonth}>{d.month}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Time Slot Picker ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🕐  Select Time Slot</Text>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    activeOpacity={0.8}
                    style={[styles.slotBtn, isSelected && styles.slotBtnSelected]}
                  >
                    {isSelected ? (
                      <LinearGradient colors={[COLORS.primary, '#6B8EFF']} style={styles.slotGrad}>
                        <Text style={[styles.slotText, { color: '#fff' }]}>{slot}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.slotText}>{slot}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Visitor Details ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>👤  Visitor Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  value={visitorName}
                  onChangeText={setVisitorName}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  value={visitorPhone}
                  onChangeText={setVisitorPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  value={visitorEmail}
                  onChangeText={setVisitorEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* ── Note ── */}
          <View style={styles.noteBox}>
            <Text style={styles.noteIcon}>💡</Text>
            <Text style={styles.noteText}>
              Our team will contact you 24 hours before your visit to confirm the schedule.
            </Text>
          </View>

          {/* ── Confirm Button ── */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, '#6B8EFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtnGrad}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>🗓  Confirm Visit</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  closeBtnText: { fontSize: 18, color: '#fff', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  scrollContent: { padding: 16, gap: 14 },

  // Property mini card
  propertyCard: {
    backgroundColor: '#fff', borderRadius: 20,
    flexDirection: 'row', overflow: 'hidden',
    ...SHADOWS.medium,
  },
  propertyCardImage: { width: 110, height: 100, resizeMode: 'cover' },
  propertyCardInfo: { flex: 1, padding: 14, justifyContent: 'center', gap: 5 },
  propertyCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  propertyCardLocation: { fontSize: 12, color: COLORS.textSecondary },
  propertyCardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  // Section card
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, ...SHADOWS.small,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },

  // Date scroll
  dateScroll: { marginHorizontal: -4 },
  dateChip: { borderRadius: 16, overflow: 'hidden' },
  dateChipSelected: {},
  dateChipGrad: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 3 },
  dateChipInner: {
    alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 3,
    backgroundColor: COLORS.background, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.border || '#E8ECFF',
  },
  dateChipDay: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  dateChipNum: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  dateChipMonth: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' },

  // Time slots
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn: {
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1.5, borderColor: COLORS.border || '#E8ECFF',
    backgroundColor: COLORS.background,
  },
  slotBtnSelected: { borderColor: 'transparent' },
  slotGrad: { paddingVertical: 10, paddingHorizontal: 14 },
  slotText: { fontSize: 13, fontWeight: '600', color: COLORS.text, paddingVertical: 10, paddingHorizontal: 14 },

  // Inputs
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.inputBg || '#F0F4FF',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: COLORS.border || '#E8ECFF',
  },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, color: COLORS.text },

  // Note
  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EEF2FF', borderRadius: 16, padding: 14,
  },
  noteIcon: { fontSize: 18 },
  noteText: { flex: 1, fontSize: 13, color: COLORS.primary, lineHeight: 19, fontWeight: '500' },

  // Confirm button
  confirmBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOWS.medium },
  confirmBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});

const successStyles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28,
  },
  iconWrap: { marginBottom: 8 },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  iconEmoji: { fontSize: 52 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 8, lineHeight: 24 },
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24, padding: 20, width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    marginTop: 4, gap: 12,
  },
  detailTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  detailSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  detailRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  detailChip: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 12, gap: 5,
  },
  detailChipLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  detailChipValue: { fontSize: 13, fontWeight: '700', color: '#fff' },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingVertical: 14, paddingHorizontal: 32,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
