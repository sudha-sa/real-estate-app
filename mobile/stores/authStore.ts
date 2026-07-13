import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  locationPreference: string;
  preferredTypes: string[];
  budgetRange: { min: number; max: number };
  notificationPrefs: {
    newPropertyAlerts: boolean;
    priceDropAlerts: boolean;
    siteVisitReminders: boolean;
    builderMessages: boolean;
  };
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch (e) {}
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post(ENDPOINTS.LOGIN, { email, password });
      const { token, user } = res.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (name, email, password, phone) => {
    set({ isLoading: true });
    try {
      const res = await api.post(ENDPOINTS.REGISTER, { name, email, password, phone });
      const { token, user } = res.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put(ENDPOINTS.UPDATE_PROFILE, data);
      const updatedUser = res.data.user;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  },
}));
