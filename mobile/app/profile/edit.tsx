import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ['2BHK', '3BHK', 'Villa', 'Studio'];

// ─── Avatar Component ─────────────────────────────────────────────────────────

const Avatar = ({ name }: { name: string }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <View style={styles.avatarWrapper}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatarCircle}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </LinearGradient>
      <TouchableOpacity style={styles.changePhotoBtn}>
        <Text style={styles.changePhotoText}>📷 Change Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Toast Component ──────────────────────────────────────────────────────────

const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.toast, type === 'success' ? styles.toastSuccess : styles.toastError, { opacity }]}>
      <Text style={styles.toastText}>{type === 'success' ? '✓ ' : '✕ '}{message}</Text>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [locationPreference, setLocationPreference] = useState(user?.locationPreference || '');
  const [preferredTypes, setPreferredTypes] = useState<string[]>(user?.preferredTypes || []);
  const [budgetMin, setBudgetMin] = useState(user?.budgetRange?.min?.toString() || '');
  const [budgetMax, setBudgetMax] = useState(user?.budgetRange?.max?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2700);
  };

  const toggleType = (type: string) => {
    setPreferredTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        locationPreference: locationPreference.trim(),
        preferredTypes,
        budgetRange: {
          min: budgetMin ? parseInt(budgetMin, 10) : 0,
          max: budgetMax ? parseInt(budgetMax, 10) : 0,
        },
      });
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => router.back(), 1500);
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveHeaderBtn}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <Avatar name={name} />

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>Personal Information</Text>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>

            {/* Location Preference */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Location Preference</Text>
              <TextInput
                style={styles.textInput}
                value={locationPreference}
                onChangeText={setLocationPreference}
                placeholder="e.g. Pune, Mumbai, Bangalore"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          {/* Preferred Types */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>Preferred Property Types</Text>
            <View style={styles.chipsRow}>
              {PROPERTY_TYPES.map((type) => {
                const selected = preferredTypes.includes(type);
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => toggleType(type)}
                    style={[styles.typeChip, selected && styles.typeChipSelected]}
                    activeOpacity={0.8}
                  >
                    {selected ? (
                      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.typeChipGrad}>
                        <Text style={styles.typeChipTextSelected}>✓ {type}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.typeChipText}>{type}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Budget Range */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>Budget Range (₹)</Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetField}>
                <Text style={styles.fieldLabel}>Minimum</Text>
                <TextInput
                  style={styles.textInput}
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  placeholder="e.g. 5000000"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetField}>
                <Text style={styles.fieldLabel}>Maximum</Text>
                <TextInput
                  style={styles.textInput}
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  placeholder="e.g. 20000000"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {(budgetMin || budgetMax) && (
              <View style={styles.budgetPreview}>
                <Text style={styles.budgetPreviewText}>
                  {budgetMin ? `₹${(parseInt(budgetMin || '0') / 100000).toFixed(0)}L` : '–'}
                  {' → '}
                  {budgetMax ? `₹${(parseInt(budgetMax || '0') / 100000).toFixed(0)}L` : '–'}
                </Text>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveBtnGrad}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  backBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '800' },
  saveHeaderBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveHeaderBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  scrollContent: { padding: 20, paddingBottom: 48 },

  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 10,
  },
  avatarInitial: { color: '#fff', fontSize: 38, fontWeight: '900' },
  changePhotoBtn: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  changePhotoText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  typeChipSelected: { borderColor: COLORS.primary },
  typeChipGrad: { paddingHorizontal: 18, paddingVertical: 10 },
  typeChipText: { paddingHorizontal: 18, paddingVertical: 10, fontSize: 13, color: COLORS.text, fontWeight: '500' },
  typeChipTextSelected: { fontSize: 13, color: '#fff', fontWeight: '700' },

  budgetRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  budgetField: { flex: 1 },
  budgetDivider: {
    width: 2, height: 44,
    backgroundColor: COLORS.border,
    marginBottom: 0, alignSelf: 'flex-end',
  },
  budgetPreview: {
    marginTop: 12,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  budgetPreviewText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  saveBtn: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastSuccess: { backgroundColor: '#10B981' },
  toastError: { backgroundColor: '#EF4444' },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
