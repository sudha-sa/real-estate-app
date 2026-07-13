import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    // Small delay so layout mounts first
    await new Promise((r) => setTimeout(r, 200));
    try {
      const onboardingDone = await AsyncStorage.getItem('onboardingDone');
      const token = await AsyncStorage.getItem('token');

      if (!onboardingDone) {
        router.replace('/onboarding');
      } else if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    } catch {
      router.replace('/onboarding');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
