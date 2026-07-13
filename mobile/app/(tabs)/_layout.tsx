import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

function TabIcon({ focused, emoji, label }: { focused: boolean; emoji: string; label: string }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.textLight }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🏠" label="Home" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🔍" label="Explore" />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="❤️" label="Saved" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="👤" label="Profile" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  tabItemActive: { backgroundColor: COLORS.primaryBg },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
});
