import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { COLORS } from '../constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationType = 'new_property' | 'price_drop' | 'visit_reminder' | 'builder_message' | 'construction_update';

interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  metadata?: {
    propertyId?: string;
    visitId?: string;
    builderId?: string;
  };
}

interface GroupedNotifications {
  title: string;
  data: Notification[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  new_property: '🏠',
  price_drop: '📉',
  visit_reminder: '🗓️',
  builder_message: '💬',
  construction_update: '🏗️',
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  new_property: '#4CAF50',
  price_drop: '#FF5722',
  visit_reminder: '#2196F3',
  builder_message: '#9C27B0',
  construction_update: '#FF9800',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isYesterday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

const groupNotifications = (notifications: Notification[]): GroupedNotifications[] => {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const earlier: Notification[] = [];

  for (const n of notifications) {
    if (isToday(n.createdAt)) today.push(n);
    else if (isYesterday(n.createdAt)) yesterday.push(n);
    else earlier.push(n);
  }

  const groups: GroupedNotifications[] = [];
  if (today.length) groups.push({ title: 'Today', data: today });
  if (yesterday.length) groups.push({ title: 'Yesterday', data: yesterday });
  if (earlier.length) groups.push({ title: 'Earlier', data: earlier });
  return groups;
};

// ─── Notification Card ────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
}

const NotificationCard = ({ notification, onPress, onDelete }: NotificationCardProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    setDeleting(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -300, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 300, useNativeDriver: true }),
    ]).start(() => onDelete());
  };

  const iconColor = NOTIFICATION_COLORS[notification.type] || COLORS.primary;
  const icon = NOTIFICATION_ICONS[notification.type] || '🔔';

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.notifCard, !notification.isRead && styles.notifCardUnread]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Unread dot */}
        {!notification.isRead && <View style={styles.unreadDot} />}

        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !notification.isRead && styles.notifTitleUnread]} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.notifTime}>{timeAgo(notification.createdAt)}</Text>
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{notification.message}</Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>🔔</Text>
    <Text style={styles.emptyTitle}>All Caught Up!</Text>
    <Text style={styles.emptySubtitle}>You have no notifications right now. Check back later.</Text>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.notifications || res.data || []);
    } catch {
      // keep existing or empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      Alert.alert('Error', 'Could not mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      Alert.alert('Error', 'Could not delete notification.');
    }
  };

  const handleNotificationPress = (n: Notification) => {
    // Mark as read locally
    setNotifications((prev) =>
      prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
    );
    // Navigate based on type
    switch (n.type) {
      case 'new_property':
      case 'price_drop':
        if (n.metadata?.propertyId) router.push(`/property/${n.metadata.propertyId}` as any);
        break;
      case 'visit_reminder':
        router.push('/profile/visits' as any);
        break;
      case 'builder_message':
        router.push('/profile' as any);
        break;
      case 'construction_update':
        if (n.metadata?.propertyId) router.push(`/property/${n.metadata.propertyId}` as any);
        break;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groups = groupNotifications(notifications);

  // Flatten groups for FlatList with section headers
  const listData: Array<{ type: 'header'; title: string } | { type: 'item'; notification: Notification }> = [];
  for (const group of groups) {
    listData.push({ type: 'header', title: group.title });
    for (const n of group.data) {
      listData.push({ type: 'item', notification: n });
    }
  }

  const renderItem = ({ item }: { item: typeof listData[number] }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }
    return (
      <NotificationCard
        notification={item.notification}
        onPress={() => handleNotificationPress(item.notification)}
        onDelete={() => handleDelete(item.notification._id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleMarkAllRead} disabled={markingAll || unreadCount === 0} style={styles.markAllBtn}>
          {markingAll ? (
            <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
          ) : (
            <Text style={[styles.markAllText, unreadCount === 0 && styles.markAllDisabled]}>
              Mark All
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${item.title}` : `notif-${item.notification._id}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  unreadBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  markAllBtn: { paddingHorizontal: 4 },
  markAllText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  markAllDisabled: { opacity: 0.4 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },

  listContent: { paddingBottom: 32, backgroundColor: COLORS.background },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 20,
    backgroundColor: COLORS.background,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 0,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 14, left: 14,
  },
  iconContainer: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0,
  },
  iconText: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 8 },
  notifTitleUnread: { fontWeight: '800' },
  notifTime: { fontSize: 11, color: COLORS.textLight, flexShrink: 0 },
  notifMessage: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  deleteBtn: {
    marginLeft: 10,
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 16 },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
