import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SIZES } from '../../constants/theme';
import Toast from 'react-native-toast-message';

export default function Login() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please enter email and password' });
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.message });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#4169E1', '#2D4FC7']} style={styles.header}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <Text style={styles.logo}>🏠 PropFinder</Text>
          <Text style={styles.headerTitle}>Welcome Back!</Text>
          <Text style={styles.headerSubtitle}>Sign in to continue your property journey</Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sign In</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoText}>📝 Demo: test@realestate.com / Test@123</Text>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={styles.loginBtn}>
            <LinearGradient
              colors={['#4169E1', '#2D4FC7']}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.registerBtn}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -40,
  },
  headerCircle2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: -30,
  },
  logo: { fontSize: 22, color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginBottom: 20 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 32,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 15, color: COLORS.text },
  eyeIcon: { fontSize: 16, padding: 4 },
  demoHint: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoText: { fontSize: 12, color: COLORS.primary, fontWeight: '500', textAlign: 'center' },
  loginBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  loginGradient: { paddingVertical: 16, alignItems: 'center' },
  loginText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textLight, fontSize: 13 },
  registerBtn: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 15, color: COLORS.textSecondary },
  registerLink: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
});
