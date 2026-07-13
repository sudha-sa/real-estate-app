import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

export default function Register() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill all required fields' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await register(name.trim(), email.trim(), password, phone.trim());
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: error.message });
    }
  };

  const InputField = ({ label, icon, value, onChange, placeholder, secure = false, keyboardType = 'default' }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#4169E1', '#2D4FC7']} style={styles.header}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <Text style={styles.logo}>🏠 PropFinder</Text>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Start your property journey today</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Register</Text>

          <InputField label="Full Name *" icon="👤" value={name} onChange={setName} placeholder="Enter your full name" />
          <InputField label="Email Address *" icon="📧" value={email} onChange={setEmail} placeholder="Enter your email" keyboardType="email-address" />
          <InputField label="Phone Number" icon="📱" value={phone} onChange={setPhone} placeholder="+91 9876543210" keyboardType="phone-pad" />
          <InputField label="Password *" icon="🔒" value={password} onChange={setPassword} placeholder="Create a password" secure />
          <InputField label="Confirm Password *" icon="🔒" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm your password" secure />

          <TouchableOpacity onPress={handleRegister} disabled={isLoading} style={styles.registerBtn}>
            <LinearGradient
              colors={['#4169E1', '#2D4FC7']}
              style={styles.registerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <Text style={styles.loginLinkBold}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60, paddingBottom: 50, paddingHorizontal: 24,
    alignItems: 'center', position: 'relative', overflow: 'hidden',
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
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: -24,
    borderRadius: 24, padding: 24,
    shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8, marginBottom: 32,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 12,
    paddingHorizontal: 14, borderWidth: 1.5, borderColor: COLORS.border,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 15, color: COLORS.text },
  eyeIcon: { fontSize: 16, padding: 4 },
  registerBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  registerGradient: { paddingVertical: 16, alignItems: 'center' },
  registerText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginLink: { flexDirection: 'row', justifyContent: 'center' },
  loginLinkText: { fontSize: 15, color: COLORS.textSecondary },
  loginLinkBold: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
});
