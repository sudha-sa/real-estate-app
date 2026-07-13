import { create } from 'zustand';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  type: string;
  bhk: number;
  sqft: number;
  status: string;
  location: { city: string; area: string; state: string; address: string };
  images: string[];
  amenities: string[];
  isVerified: boolean;
  isFeatured: boolean;
  isSaved: boolean;
  builder: { name: string; phone: string; email: string; rating: number; experience: string };
  constructionProgress: any;
  tags: string[];
  rating: number;
  viewCount: number;
}

interface PropertyStore {
  properties: Property[];
  featuredProperties: Property[];
  savedProperties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  total: number;
  page: number;
  pages: number;

  fetchProperties: (params?: any) => Promise<void>;
  fetchFeatured: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  fetchSavedProperties: () => Promise<void>;
  saveProperty: (id: string) => Promise<void>;
  unsaveProperty: (id: string) => Promise<void>;
  toggleSave: (id: string, isSaved: boolean) => Promise<void>;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  featuredProperties: [],
  savedProperties: [],
  selectedProperty: null,
  isLoading: false,
  total: 0,
  page: 1,
  pages: 1,

  fetchProperties: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.get(ENDPOINTS.PROPERTIES, { params });
      set({
        properties: res.data.properties,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const res = await api.get(ENDPOINTS.FEATURED);
      set({ featuredProperties: res.data.properties });
    } catch (e) {}
  },

  fetchPropertyById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`${ENDPOINTS.PROPERTIES}/${id}`);
      set({ selectedProperty: res.data.property, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  fetchSavedProperties: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get(ENDPOINTS.SAVED_PROPERTIES);
      set({ savedProperties: res.data.properties, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  saveProperty: async (id) => {
    await api.post(`${ENDPOINTS.PROPERTIES}/${id}/save`);
  },

  unsaveProperty: async (id) => {
    await api.delete(`${ENDPOINTS.PROPERTIES}/${id}/save`);
  },

  toggleSave: async (id, isSaved) => {
    try {
      if (isSaved) {
        await api.delete(`${ENDPOINTS.PROPERTIES}/${id}/save`);
      } else {
        await api.post(`${ENDPOINTS.PROPERTIES}/${id}/save`);
      }
      // Update local state
      set((state) => ({
        properties: state.properties.map((p) =>
          p._id === id ? { ...p, isSaved: !isSaved } : p
        ),
        featuredProperties: state.featuredProperties.map((p) =>
          p._id === id ? { ...p, isSaved: !isSaved } : p
        ),
        selectedProperty:
          state.selectedProperty?._id === id
            ? { ...state.selectedProperty, isSaved: !isSaved }
            : state.selectedProperty,
      }));
    } catch (e) {
      throw e;
    }
  },
}));
