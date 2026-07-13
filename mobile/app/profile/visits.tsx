import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Modal, Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SHADOWS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const TIME_SLOTS = [
  '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM',
];

export default function MyVisits() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModal, setCancelModal] = useState<any>(null);
  const [rescheduleModal, setRescheduleModal] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => { loadVisits(); }, []);

  const loadVisits = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(ENDPOINTS.VISITS);
      setUpcoming(res.data.upcoming || []);
      setPast(res.data.past || []);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load visits' });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const handleCancel = async (visitId: string) => {
    try {
      await api.delete(`${ENDPOINTS.VISITS}/${visitId}`);
      setCancelModal(null);
      Toast.show({ type: 'success', text1: 'Visit Cancelled' });
      loadVisits();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to cancel visit' });
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedSlot) {
      Toast.show({ type: 'error', text1: 'Select date and time slot' });
      return;
    }
    try {
      await api.put(`${ENDPOINTS.VISITS}/${rescheduleModal._id}/reschedule`, {
        date: selectedDate,
        timeSlot: selectedSlot,
      });
      setRescheduleModal(null);
      Toast.show({ type: 'success', text1: 'Visit Rescheduled! ✅' });
      loadVisits();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to reschedule' });
    }
  };

  // Generate next 14 days
  const getNext14Days = () => {
    const days = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        value: d.toISOString().split('T')[0],
      });
    }
    return days;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const VisitCard = ({ visit }: { visit: any }) => {
    const property = visit.propertyId;
    const isUpcoming = visit.status === 'upcoming';

    return (
      <View style={styles.visitCard}>
        <View style={styles.visitCardInner}>
          {/* Property Image */}
          {property?.images?.[0] ? (
            <Image source={{ uri: property.images[0] }} style={styles.visitImage} />
          ) : (
            <View style={[styles.visitImage, { backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 28 }}>🏠</Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.visitInfo}>
            <Text style={styles.visitProperty} numberOfLines={1}>
              {property?.title || 'Property'}
            </Text>
            <Text style={styles.visitLocation} numberOfLines={1}>
              📍 {property?.location?.area}, {property?.location?.city}
            </Text>
            <View style={styles.visitDateTime}>
              <Text style={styles.visitDateText}>📅 {formatDate(visit.date)}</Text>
            </View>
            <Text style={styles.visitSlot}>⏰ {visit.timeSlot}</Text>

            <View style={[styles.statusBadge, {
              backgroundColor: isUpcoming ? COLORS.primaryBg : visit.status === 'completed' ? '#D1FAE5' : '#FEE2E2'
            }]}>
              <Text style={[styles.statusText, {
                color: isUpcoming ? COLORS.primary : visit.status === 'completed' ? COLORS.success : COLORS.error
              }]}>
                {isUpcoming ? '📅 Upcoming' : visit.status === 'completed' ? '✅ Completed' : '❌ Cancelled'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action buttons for upcoming */}
        {isUpcoming && (
          <View style={styles.visitActions}>
            <TouchableOpacity
              style={styles.rescheduleBtn}
              onPress={() => {
                setRescheduleModal(visit);
                setSelectedDate('');
                setSelectedSlot('');
              }}
            >
              <Text style={styles.rescheduleBtnText}>📅 Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setCancelModal(visit)}
            >
              <Text style={styles.cancelBtnText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const EmptyState = ({ tab }: { tab: string }) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{tab === 'upcoming' ? '📅' : '🕐'}</Text>
      <Text style={styles.emptyTitle}>
        {tab === 'upcoming' ? 'No Upcoming Visits' : 'No Past Visits'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'upcoming'
          ? 'Book a site visit from any property page'
          : 'Your completed visits will appear here'}
      </Text>
      {tab === 'upcoming' && (
        <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/explore')}>
          <LinearGradient colors={['#4169E1', '#2D4FC7']} style={styles.exploreBtnGrad}>
            <Text style={styles.exploreBtnText}>Explore Properties</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const days = getNext14Days();
  const currentList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Site Visits</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['upcoming', 'past'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'upcoming' ? `📅 Upcoming (${upcoming.length})` : `🕐 Past (${past.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading visits...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {currentList.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            currentList.map((visit) => <VisitCard key={visit._id} visit={visit} />)
          )}
        </ScrollView>
      )}

      {/* Cancel Modal */}
      <Modal visible={!!cancelModal} transparent animationType="fade" onRequestClose={() => setCancelModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={styles.modalTitle}>Cancel Visit?</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to cancel your visit to{'\n'}
              <Text style={{ fontWeight: '700' }}>{cancelModal?.propertyId?.title}</Text>?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCancelModal(null)}>
                <Text style={styles.modalCancelText}>Keep Visit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => handleCancel(cancelModal._id)}>
                <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.modalConfirmGrad}>
                  <Text style={styles.modalConfirmText}>Cancel Visit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal visible={!!rescheduleModal} transparent animationType="slide" onRequestClose={() => setRescheduleModal(null)}>
        <View style={styles.rescheduleOverlay}>
          <View style={styles.rescheduleSheet}>
            <View style={styles.rescheduleHeader}>
              <Text style={styles.rescheduleTitle}>Reschedule Visit</Text>
              <TouchableOpacity onPress={() => setRescheduleModal(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => setSelectedDate(day.value)}
                  style={[styles.dateChip, selectedDate === day.value && styles.dateChipActive]}
                >
                  <Text style={[styles.dateChipText, selectedDate === day.value && styles.dateChipTextActive]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Select Time Slot</Text>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setSelectedSlot(slot)}
                  style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                >
                  <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleReschedule} style={styles.confirmRescheduleBtn}>
              <LinearGradient colors={['#4169E1', '#2D4FC7']} style={styles.confirmRescheduleGrad}>
                <Text style={styles.confirmRescheduleText}>Confirm Reschedule</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 20, color: COLORS.text, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4,
    gap: 8,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.background, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primaryBg, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14 },
  visitCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14,
    overflow: 'hidden', ...SHADOWS.small,
  },
  visitCardInner: { flexDirection: 'row', padding: 14, gap: 12 },
  visitImage: { width: 90, height: 90, borderRadius: 12 },
  visitInfo: { flex: 1 },
  visitProperty: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  visitLocation: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 5 },
  visitDateTime: { marginBottom: 2 },
  visitDateText: { fontSize: 12, color: COLORS.textSecondary },
  visitSlot: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  visitActions: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 14,
  },
  rescheduleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.primaryBg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.primary,
  },
  rescheduleBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  cancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#FEE2E2', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.error,
  },
  cancelBtnText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, paddingHorizontal: 24 },
  exploreBtn: { borderRadius: 14, overflow: 'hidden' },
  exploreBtnGrad: { paddingHorizontal: 28, paddingVertical: 14 },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center' },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.background, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  modalConfirmBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  modalConfirmGrad: { paddingVertical: 14, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  // Reschedule sheet
  rescheduleOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  rescheduleSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  rescheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  rescheduleTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  closeBtn: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10 },
  dateChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginRight: 8,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  dateChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  dateChipTextActive: { color: '#fff' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  slotChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  slotChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  slotTextActive: { color: '#fff' },
  confirmRescheduleBtn: { borderRadius: 14, overflow: 'hidden' },
  confirmRescheduleGrad: { paddingVertical: 16, alignItems: 'center' },
  confirmRescheduleText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
