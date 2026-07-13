import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import PropertyCard from '../../components/property/PropertyCard';
import { usePropertyStore } from '../../stores/propertyStore';

const { width, height } = Dimensions.get('window');

const SORT_OPTIONS = ['Recently Saved', 'Price Low-High', 'Price High-Low', 'Name A-Z'];

export default function SavedScreen() {
  const router = useRouter();
  const { savedProperties, fetchSavedProperties, isLoading, unsaveProperty } = usePropertyStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeSort, setActiveSort] = useState('Recently Saved');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState<any>(null);

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSavedProperties();
      Toast.show({ type: 'success', text1: 'Refreshed!', visibilityTime: 1500 });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to refresh' });
    } finally {
      setRefreshing(false);
    }
  }, [fetchSavedProperties]);

  const handleUnsavePress = (property: any) => {
    setPropertyToRemove(property);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!propertyToRemove) return;
    try {
      await unsaveProperty(propertyToRemove.id);
      Toast.show({ type: 'success', text1: 'Removed from saved' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to remove' });
    } finally {
      setShowRemoveModal(false);
      setPropertyToRemove(null);
    }
  };

  const sortedProperties = [...(savedProperties || [])].sort((a, b) => {
    if (activeSort === 'Price Low-High') return (a.price || 0) - (b.price || 0);
    if (activeSort === 'Price High-Low') return (b.price || 0) - (a.price || 0);
    if (activeSort === 'Name A-Z') return (a.title || '').localeCompare(b.title || '');
    return new Date(b.savedAt || b.createdAt || 0).getTime() - new Date(a.savedAt || a.createdAt || 0).getTime();
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏚️</Text>
      <Text style={styles.emptyTitle}>No saved properties yet</Text>
      <Text style={styles.emptySubtitle}>
        Save properties you like and they'll appear here for easy access.
      </Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={() => router.push('/(tabs)/explore')}
        activeOpacity={0.85}
      >
        <LinearGradient colors={[COLORS.primary || '#4169E1', '#6B8EF5']} style={styles.exploreBtnGradient}>
          <Text style={styles.exploreBtnText}>🔍  Explore Properties</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View>
      <LinearGradient colors={[COLORS.primary || '#4169E1', '#6B8EF5']} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Saved Properties</Text>
        <Text style={styles.headerSubtitle}>
          {sortedProperties.length > 0
            ? `${sortedProperties.length} propert${sortedProperties.length === 1 ? 'y' : 'ies'} saved`
            : 'Your wishlist is empty'}
        </Text>
      </LinearGradient>

      {sortedProperties.length > 0 && (
        <View style={styles.toolbar}>
          <Text style={styles.resultsCount}>{sortedProperties.length} Saved</Text>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortModal(true)}>
            <Text style={styles.sortBtnIcon}>↕</Text>
            <Text style={styles.sortBtnText}>{activeSort}</Text>
            <Text style={styles.sortBtnChevron}>›</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {isLoading && !refreshing ? (
        <View style={styles.fullLoadingContainer}>
          <LinearGradient colors={[COLORS.primary || '#4169E1', '#6B8EF5']} style={styles.headerGradient}>
            <Text style={styles.headerTitle}>Saved Properties</Text>
            <Text style={styles.headerSubtitle}>Loading...</Text>
          </LinearGradient>
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={COLORS.primary || '#4169E1'} />
            <Text style={styles.loadingText}>Loading saved properties...</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={sortedProperties}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          ListHeaderComponent={renderHeader()}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PropertyCard
                property={item}
                onSavePress={() => handleUnsavePress(item)}
              />
            </View>
          )}
          ListEmptyComponent={renderEmpty()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary || '#4169E1'}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/ai-assistant')}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#7C3AED', '#4169E1']} style={styles.fabGradient}>
          <Text style={styles.fabIcon}>🤖</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.sortModalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.sortModalTitle}>Sort By</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortOption, activeSort === opt && styles.sortOptionActive]}
                onPress={() => {
                  setActiveSort(opt);
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, activeSort === opt && styles.sortOptionTextActive]}>
                  {opt}
                </Text>
                {activeSort === opt && (
                  <View style={styles.sortCheckCircle}>
                    <Text style={styles.sortCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowSortModal(false)}>
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal
        visible={showRemoveModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowRemoveModal(false)}
          />
          <View style={styles.confirmModalContainer}>
            <Text style={styles.confirmEmoji}>🗑️</Text>
            <Text style={styles.confirmTitle}>Remove from Saved?</Text>
            <Text style={styles.confirmSubtitle}>
              {propertyToRemove?.title || 'This property'} will be removed from your saved list.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => {
                  setShowRemoveModal(false);
                  setPropertyToRemove(null);
                }}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmRemoveBtn} onPress={handleConfirmRemove}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.confirmRemoveGradient}
                >
                  <Text style={styles.confirmRemoveText}>Remove</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F7FF',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(65,105,225,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  sortBtnIcon: { fontSize: 14 },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text || '#1A1A2E',
    maxWidth: 110,
  },
  sortBtnChevron: {
    fontSize: 18,
    color: COLORS.textSecondary || '#6B7280',
    marginTop: -1,
  },
  listContent: { paddingBottom: 120 },
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  fullLoadingContainer: { flex: 1 },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text || '#1A1A2E',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary || '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  exploreBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    borderRadius: 30,
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { fontSize: 26 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sortModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text || '#1A1A2E',
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 6,
  },
  sortOptionActive: { backgroundColor: 'rgba(65,105,225,0.08)' },
  sortOptionText: {
    fontSize: 15,
    color: COLORS.text || '#1A1A2E',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: COLORS.primary || '#4169E1',
    fontWeight: '700',
  },
  sortCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary || '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  closeModalBtn: {
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(65,105,225,0.2)',
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
  },
  confirmModalContainer: {
    position: 'absolute',
    top: '50%',
    left: 24,
    right: 24,
    transform: [{ translateY: -120 }],
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  confirmEmoji: {
    fontSize: 44,
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text || '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary || '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(65,105,225,0.2)',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
  },
  confirmRemoveBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmRemoveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmRemoveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
