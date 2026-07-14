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
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

const QUICK_FILTERS = ['All', '2BHK', '3BHK', 'Villa', 'Studio', 'Ready to Move', 'Under Construction'];
const SORT_OPTIONS = ['Newest', 'Price Low-High', 'Price High-Low', 'Most Popular'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Studio', '2BHK', '3BHK', 'Penthouse', 'Plot', 'Commercial'];

export default function ExploreScreen() {
  const router = useRouter();
  const { properties, fetchProperties, isLoading } = usePropertyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  const [tempSelectedTypes, setTempSelectedTypes] = useState<string[]>([]);
  const [tempSelectedCities, setTempSelectedCities] = useState<string[]>([]);

  const activeFiltersCount =
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    selectedTypes.length +
    selectedCities.length;

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProperties();
      Toast.show({ type: 'success', text1: 'Refreshed!', visibilityTime: 1500 });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to refresh' });
    } finally {
      setRefreshing(false);
    }
  }, [fetchProperties]);

  const openFilterModal = () => {
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setTempSelectedTypes([...selectedTypes]);
    setTempSelectedCities([...selectedCities]);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setSelectedTypes(tempSelectedTypes);
    setSelectedCities(tempSelectedCities);
    setShowFilterModal(false);
    Toast.show({ type: 'success', text1: 'Filters applied!' });
  };

  const resetFilters = () => {
    setTempMinPrice('');
    setTempMaxPrice('');
    setTempSelectedTypes([]);
    setTempSelectedCities([]);
  };

  const toggleTempType = (type: string) => {
    setTempSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTempCity = (city: string) => {
    setTempSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const filteredProperties = (properties || []).filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.location &&
        (typeof p.location === 'string'
          ? p.location.toLowerCase().includes(q)
          : (p.location.address && p.location.address.toLowerCase().includes(q)) ||
            (p.location.area && p.location.area.toLowerCase().includes(q)) ||
            (p.location.city && p.location.city.toLowerCase().includes(q)) ||
            (p.location.state && p.location.state.toLowerCase().includes(q))));

    const matchQuickFilter =
      activeQuickFilter === 'All' ||
      (p.type && p.type.toLowerCase().includes(activeQuickFilter.toLowerCase())) ||
      (p.status && p.status.toLowerCase().includes(activeQuickFilter.toLowerCase()));

    const matchMinPrice = !minPrice || (p.price && p.price >= Number(minPrice));
    const matchMaxPrice = !maxPrice || (p.price && p.price <= Number(maxPrice));
    const matchType = selectedTypes.length === 0 || (p.type && selectedTypes.includes(p.type));
    const matchCity = selectedCities.length === 0 || (p.location?.city && selectedCities.includes(p.location.city));

    return matchSearch && matchQuickFilter && matchMinPrice && matchMaxPrice && matchType && matchCity;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (activeSort === 'Price Low-High') return (a.price || 0) - (b.price || 0);
    if (activeSort === 'Price High-Low') return (b.price || 0) - (a.price || 0);
    if (activeSort === 'Most Popular') return (b.views || 0) - (a.views || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const renderHeader = () => (
    <View>
      <LinearGradient colors={[COLORS.primary || '#4169E1', '#6B8EF5']} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Find your perfect home</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, locality, project..."
            placeholderTextColor={COLORS.textSecondary || '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilterScroll}
        contentContainerStyle={styles.quickFilterContent}
      >
        {QUICK_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeQuickFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveQuickFilter(filter)}
          >
            <Text style={[styles.filterChipText, activeQuickFilter === filter && styles.filterChipTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.toolbar}>
        <Text style={styles.resultsCount}>{sortedProperties.length} Properties</Text>
        <View style={styles.toolbarRight}>
          <TouchableOpacity style={styles.toolbarBtn} onPress={openFilterModal}>
            <Text style={styles.toolbarBtnIcon}>⚡</Text>
            <Text style={styles.toolbarBtnText}>Filter</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn} onPress={() => setShowSortDropdown(v => !v)}>
            <Text style={styles.toolbarBtnIcon}>↕</Text>
            <Text style={styles.toolbarBtnText}>{activeSort}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏘️</Text>
      <Text style={styles.emptyTitle}>No Properties Found</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => {
          setSearchQuery('');
          setActiveQuickFilter('All');
          setMinPrice('');
          setMaxPrice('');
          setSelectedTypes([]);
          setSelectedCities([]);
        }}
      >
        <Text style={styles.emptyBtnText}>Clear All Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <FlatList
        data={sortedProperties}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary || '#4169E1'} />
              <Text style={styles.loadingText}>Loading properties...</Text>
            </View>
          ) : renderEmpty()
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary || '#4169E1'} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Sort Dropdown Overlay */}
      {showSortDropdown && (
        <>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowSortDropdown(false)}
          />
          <View style={styles.sortDropdown}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortOption, activeSort === opt && styles.sortOptionActive]}
                onPress={() => {
                  setActiveSort(opt);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={[styles.sortOptionText, activeSort === opt && styles.sortOptionTextActive]}>
                  {opt}
                </Text>
                {activeSort === opt && <Text style={styles.sortCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Floating AI Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/ai-assistant')} activeOpacity={0.85}>
        <LinearGradient colors={['#7C3AED', '#4169E1']} style={styles.fabGradient}>
          <Text style={styles.fabIcon}>🤖</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={styles.filterModalContainer}>
            <View style={styles.filterModalHandle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Filters</Text>
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.filterResetText}>Reset All</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.filterSectionTitle}>💰 Price Range (₹)</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputWrap}>
                  <Text style={styles.priceLabel}>Min Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="e.g. 2000000"
                    placeholderTextColor={COLORS.textSecondary || '#6B7280'}
                    keyboardType="numeric"
                    value={tempMinPrice}
                    onChangeText={setTempMinPrice}
                  />
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceInputWrap}>
                  <Text style={styles.priceLabel}>Max Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="e.g. 10000000"
                    placeholderTextColor={COLORS.textSecondary || '#6B7280'}
                    keyboardType="numeric"
                    value={tempMaxPrice}
                    onChangeText={setTempMaxPrice}
                  />
                </View>
              </View>

              <Text style={styles.filterSectionTitle}>🏠 Property Type</Text>
              <View style={styles.chipGrid}>
                {PROPERTY_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.multiChip, tempSelectedTypes.includes(type) && styles.multiChipActive]}
                    onPress={() => toggleTempType(type)}
                  >
                    <Text style={[styles.multiChipText, tempSelectedTypes.includes(type) && styles.multiChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>📍 City</Text>
              <View style={styles.chipGrid}>
                {CITIES.map(city => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.multiChip, tempSelectedCities.includes(city) && styles.multiChipActive]}
                    onPress={() => toggleTempCity(city)}
                  >
                    <Text style={[styles.multiChipText, tempSelectedCities.includes(city) && styles.multiChipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.filterModalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowFilterModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                  <LinearGradient colors={[COLORS.primary || '#4169E1', '#6B8EF5']} style={styles.applyBtnGradient}>
                    <Text style={styles.applyBtnText}>Apply Filters</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    marginTop: 2,
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text || '#1A1A2E',
  },
  clearBtn: { padding: 4 },
  clearBtnText: {
    fontSize: 14,
    color: COLORS.textSecondary || '#6B7280',
    fontWeight: '600',
  },
  quickFilterScroll: { marginTop: 16 },
  quickFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(65,105,225,0.25)',
    marginRight: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary || '#4169E1',
    borderColor: COLORS.primary || '#4169E1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary || '#4169E1',
  },
  filterChipTextActive: { color: '#FFFFFF' },
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
  toolbarRight: {
    flexDirection: 'row',
    gap: 10,
  },
  toolbarBtn: {
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
  toolbarBtnIcon: { fontSize: 14 },
  toolbarBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text || '#1A1A2E',
  },
  filterBadge: {
    backgroundColor: COLORS.primary || '#4169E1',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sortDropdown: {
    position: 'absolute',
    top: 210,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    width: 190,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  sortOptionActive: { backgroundColor: 'rgba(65,105,225,0.08)' },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.text || '#1A1A2E',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: COLORS.primary || '#4169E1',
    fontWeight: '700',
  },
  sortCheck: {
    color: COLORS.primary || '#4169E1',
    fontWeight: '800',
    fontSize: 14,
  },
  listContent: { paddingBottom: 120 },
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary || '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary || '#4169E1',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#FFF',
    fontSize: 15,
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
  filterModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: height * 0.82,
  },
  filterModalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  filterModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text || '#1A1A2E',
  },
  filterResetText: {
    fontSize: 14,
    color: COLORS.primary || '#4169E1',
    fontWeight: '600',
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
    marginBottom: 12,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  priceInputWrap: { flex: 1 },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary || '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(65,105,225,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.text || '#1A1A2E',
    backgroundColor: '#F8F9FF',
  },
  priceDivider: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 1,
    marginTop: 18,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  multiChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(65,105,225,0.25)',
    backgroundColor: '#F8F9FF',
  },
  multiChipActive: {
    backgroundColor: COLORS.primary || '#4169E1',
    borderColor: COLORS.primary || '#4169E1',
  },
  multiChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary || '#6B7280',
  },
  multiChipTextActive: { color: '#FFFFFF' },
  filterModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(65,105,225,0.2)',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
  },
  applyBtn: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
