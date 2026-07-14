import React, { useState } from 'react';
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
import { useAuthStore } from '../../stores/authStore';

const { width, height } = Dimensions.get('window');

const APP_VERSION = '1.0.0';

const MENU_ITEMS = [
  {
    id: 'visits',
    emoji: '🗓️',
    label: 'My Site Visits',
    sublabel: 'View scheduled property visits',
    route: '/profile/visits',
    type: 'nav',
  },
  {
    id: 'preferences',
    emoji: '🔔',
    label: 'Preferences',
    sublabel: 'Notification & search preferences',
    route: '/profile/preferences',
    type: 'nav',
  },
  {
    id: 'settings',
    emoji: '⚙️',
    label: 'Account Settings',
    sublabel: 'Manage your account',
    route: null,
    type: 'alert',
    alertTitle: 'Coming Soon',
    alertMessage: 'Account settings are coming soon in the next update!',
  },
  {
    id: 'help',
    emoji: '❓',
    label: 'Help & Support',
    sublabel: 'FAQs and customer support',
    route: null,
    type: 'alert',
    alertTitle: 'Help & Support',
    alertMessage:
      'Q: How do I schedule a site visit?\nA: Tap on any property and click "Schedule Visit".\n\nQ: How do I contact a seller?\nA: Use the "Contact Agent" button on property details.\n\nQ: Is the app free to use?\nA: Yes, completely free for buyers!',
  },
  {
    id: 'terms',
    emoji: '📋',
    label: 'Terms of Service',
    sublabel: 'Read our terms and conditions',
    route: null,
    type: 'alert',
    alertTitle: 'Terms of Service',
    alertMessage:
      'By using RealEstate App, you agree to our terms of service. We provide property listings for informational purposes. All transactions are between buyers and sellers directly.',
  },
  {
    id: 'privacy',
    emoji: '🔒',
    label: 'Privacy Policy',
    sublabel: 'How we handle your data',
    route: null,
    type: 'alert',
    alertTitle: 'Privacy Policy',
    alertMessage:
      'We value your privacy. Your personal data is encrypted and never sold to third parties. We only collect data necessary to improve your property search experience.',
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleMenuPress = (item: typeof MENU_ITEMS[0]) => {
    if (item.type === 'nav' && item.route) {
      router.push(item.route as any);
    } else if (item.type === 'alert') {
      Alert.alert(item.alertTitle || item.label, item.alertMessage || '', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      Toast.show({ type: 'success', text1: 'Logged out successfully' });
      setTimeout(() => {
        router.replace('/auth/login');
      }, 400);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Logout failed. Try again.' });
    } finally {
      setLoggingOut(false);
    }
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getAvatarColors = (): [string, string] => {
    return ['#7C3AED', '#4169E1'];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Gradient */}
        <LinearGradient colors={[COLORS.primary || '#4169E1', '#6B8EF5']} style={styles.headerGradient}>
          <Text style={styles.headerLabel}>My Profile</Text>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={getAvatarColors()} style={styles.avatarContainer}>
              <Text style={styles.avatarInitial}>{getUserInitial()}</Text>
            </LinearGradient>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'Welcome'}
              </Text>
              {user?.email ? (
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
              {user?.phone ? (
                <Text style={styles.userPhone} numberOfLines={1}>
                  📞 {user.phone}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.8}
          >
            <Text style={styles.editProfileBtnText}>✏️  Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {user?.savedCount || 0}
            </Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {user?.visitsCount || 0}
            </Text>
            <Text style={styles.statLabel}>Site Visits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {user?.inquiriesCount || 0}
            </Text>
            <Text style={styles.statLabel}>Inquiries</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          {MENU_ITEMS.slice(0, 2).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIconWrap}>
                  <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.menuItemTextWrap}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemSublabel}>{item.sublabel}</Text>
                </View>
              </View>
              <Text style={styles.menuItemChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>More</Text>
          {MENU_ITEMS.slice(2).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === MENU_ITEMS.slice(2).length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIconWrap}>
                  <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.menuItemTextWrap}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemSublabel}>{item.sublabel}</Text>
                </View>
              </View>
              <Text style={styles.menuItemChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.logoutGradient}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.appName}>RealEstate App</Text>
          <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          <Text style={styles.copyrightText}>© 2024 RealEstate Inc. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => !loggingOut && setShowLogoutModal(false)}
          />
          <View style={styles.logoutModalContainer}>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.logoutModalIconBg}>
              <Text style={styles.logoutModalEmoji}>🚪</Text>
            </LinearGradient>

            <Text style={styles.logoutModalTitle}>Logout?</Text>
            <Text style={styles.logoutModalSubtitle}>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </Text>

            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={styles.logoutCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                disabled={loggingOut}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutConfirmBtn}
                onPress={handleLogout}
                disabled={loggingOut}
              >
                <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.logoutConfirmGradient}>
                  {loggingOut ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.logoutConfirmText}>Logout</Text>
                  )}
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
  scrollContent: {
    paddingBottom: 60,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 22,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  editProfileBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary || '#4169E1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary || '#6B7280',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 6,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary || '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemFirst: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 0,
  },
  menuItemLast: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuItemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(65,105,225,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemEmoji: {
    fontSize: 22,
  },
  menuItemTextWrap: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
    marginBottom: 2,
  },
  menuItemSublabel: {
    fontSize: 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  menuItemChevron: {
    fontSize: 22,
    color: COLORS.textSecondary || '#6B7280',
    fontWeight: '300',
  },
  logoutBtn: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 8,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: 'rgba(107,114,128,0.6)',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  logoutModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    marginHorizontal: 28,
    alignItems: 'center',
    width: width - 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  logoutModalIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoutModalEmoji: {
    fontSize: 30,
  },
  logoutModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text || '#1A1A2E',
    marginBottom: 10,
  },
  logoutModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary || '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(65,105,225,0.2)',
    alignItems: 'center',
  },
  logoutCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#1A1A2E',
  },
  logoutConfirmBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutConfirmGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  logoutConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
