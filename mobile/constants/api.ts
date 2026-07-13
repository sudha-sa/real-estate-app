import Constants from 'expo-constants';

// For local development: use your machine's local IP
// Run: ipconfig getifaddr en0  (on Mac) to get your IP
const LOCAL_IP = '172.28.188.18'; // <-- Change this to your machine IP

export const API_BASE_URL = `http://${LOCAL_IP}:5001/api`;

export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  ME: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',

  // Properties
  PROPERTIES: '/properties',
  FEATURED: '/properties/featured',
  SAVED_PROPERTIES: '/properties/saved',

  // Visits
  VISITS: '/visits',

  // Notifications
  NOTIFICATIONS: '/notifications',
  READ_ALL: '/notifications/read-all',

  // AI
  AI_CHAT: '/ai/chat',
  AI_QUESTIONNAIRE: '/ai/questionnaire',
  AI_SUGGESTIONS: '/ai/suggestions',
  AI_QUESTIONS: '/ai/questionnaire/questions',
};

export const TIME_SLOTS = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
];
