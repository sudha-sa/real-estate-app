import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../stores/authStore';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../components/common/ToastConfig';

export default function RootLayout() {
  const { loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="property/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="property/construction/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="property/book-visit/[id]"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="ai-assistant"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="notifications"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="profile/visits"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="profile/preferences"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
