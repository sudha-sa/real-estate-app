import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SHADOWS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const PROPERTY_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Studio', 'Penthouse'];
const CITIES = ['Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Chennai'];

export default function Preferences() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [notifPrefs, setNotifPrefs] = useState({
    newPropertyAlerts: user?.notificationPrefs?.newPropertyAlerts ?? true,
    priceDropAlerts: user?.notificationPrefs?.priceDropAlerts ?? true,
    siteVisitReminders: user?.notificationPrefs?.siteVisitReminders ?? true,
    builderMessages: user?.notificationPrefs?.builderMessages ?? true,
  });

  const [selectedTypes, setSelectedTypes] = useState<string[]>(user?.preferredTypes || []);
  const [defaultCity, setDefaultCity] = useState(user?.locationPreference || 'Mumbai');
  const [minBudget, setMinBudget] = useState(String(user?.budgetRange?.min || 0));
  const [maxBudget, setMaxBudget] = useState(String(user?.budgetRange?.max || 10000000));
  const [isSaving, setIsSaving] = useState(false);

  const toggleNotif = async (key: keyof typeof notifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      await updateProfile({ notificationPrefs: updated });
    } catch {}
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        locationPreference: defaultCity,
        preferredTypes: selectedTypes,
        budgetRange: {
          min: Number(minBudget) || 0,
          max: Number(maxBudget) || 10000000,
        },
        notificationPrefs: notifPrefs,
      });
      Toast.show({ type: 'success', text1: 'Preferences Saved! ✅' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save preferences' });
    } finally {
      setIsSaving(false);
    }
  };

  const NotifToggle = ({ label, icon, prefKey }: { label: string; icon: string; prefKey: keyof typeof notifPrefs }) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        <View style={styles.toggleIcon}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
      <Switch
        value={notifPrefs[prefKey]}
        onValueChange={() => toggleNotif(prefKey)}
        trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
        thumbColor={notifPrefs[prefKey] ? COLORS.primary : '#f4f3f4'}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notification Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEmoji}>🔔</Text>
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.card}>
            <NotifToggle label="New Property Alerts" icon="🏠" prefKey="newPropertyAlerts" />
            <View style={styles.divider} />
            <NotifToggle label="Price Drop Alerts" icon="📉" prefKey="priceDropAlerts" />
            <View style={styles.divider} />
            <NotifToggle label="Site Visit Reminders" icon="📅" prefKey="siteVisitReminders" />
            <View style={styles.divider} />
            <NotifToggle label="Builder Messages" icon="💬" prefKey="builderMessages" />
          </View>
        </View>

        {/* Default Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEmoji}>📍</Text>
            <Text style={styles.sectionTitle}>Default Location</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Preferred City</Text>
            <View style={styles.cityGrid}>
              {CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => setDefaultCity(city)}
                  style={[styles.cityChip, defaultCity === city && styles.cityChipActive]}
                >
                  <Text style={[styles.cityChipText, defaultCity === city && styles.cityChipTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Preferred Property Types */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEmoji}>🏠</Text>
            <Text style={styles.sectionTitle}>Preferred Property Types</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Select all that apply</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => toggleType(type)}
                  style={[styles.typeChip, selectedTypes.includes(type) && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, selectedTypes.includes(type) && styles.typeChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Budget Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEmoji}>💰</Text>
            <Text style={styles.sectionTitle}>Budget Range (Lakhs)</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.budgetRow}>
              <View style={styles.budgetField}>
                <Text style={styles.inputLabel}>Min Budget (₹L)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    style={styles.budgetInput}
                    value={minBudget}
                    onChangeText={setMinBudget}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetField}>
                <Text style={styles.inputLabel}>Max Budget (₹L)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    style={styles.budgetInput}
                    value={maxBudget}
                    onChangeText={setMaxBudget}
                    keyboardType="numeric"
                    placeholder="500"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveBtn}>
          <LinearGradient
            colors={['#4169E1', '#2D4FC7']}
            style={styles.saveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveText}>{isSaving ? 'Saving...' : '💾 Save Preferences'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: COLORS.text, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scrollContent: { padding: 16 },
  section: { marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, ...SHADOWS.small,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  toggleLabel: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10 },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  cityChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cityChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  cityChipTextActive: { color: '#fff' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeChipActive: { backgroundColor: COLORS.primaryBg, borderColor: COLORS.primary },
  typeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  typeChipTextActive: { color: COLORS.primary },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetField: { flex: 1 },
  budgetDivider: { width: 1, height: 40, backgroundColor: COLORS.border, marginTop: 18 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: 10,
    paddingHorizontal: 10, borderWidth: 1.5, borderColor: COLORS.border, height: 44,
  },
  rupeeSymbol: { fontSize: 15, color: COLORS.textSecondary, marginRight: 4 },
  budgetInput: { flex: 1, fontSize: 14, color: COLORS.text },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  saveGradient: { paddingVertical: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
