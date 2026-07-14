import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────────────────

interface PropertyCard {
  _id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  properties?: PropertyCard[];
  timestamp: Date;
}

interface Suggestion {
  _id: string;
  text: string;
}

interface Question {
  _id: string;
  key: string;
  question: string;
  options: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price: number) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
  return `₹${price.toLocaleString()}`;
};

const uid = () => Math.random().toString(36).slice(2);

// ─── Sub-components ──────────────────────────────────────────────────────────

const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 150);
    const a3 = anim(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.typingContainer}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  );
};

const PropertyMiniCard = ({ property, onPress }: { property: PropertyCard; onPress: () => void }) => (
  <TouchableOpacity style={styles.propCard} onPress={onPress} activeOpacity={0.85}>
    <Image
      source={{ uri: property.images?.[0] || 'https://via.placeholder.com/80x60' }}
      style={styles.propCardImage}
    />
    <View style={styles.propCardInfo}>
      <Text style={styles.propCardTitle} numberOfLines={1}>{property.title}</Text>
      <Text style={styles.propCardLocation} numberOfLines={1}>📍 {property.location}</Text>
      <Text style={styles.propCardPrice}>{formatPrice(property.price)}</Text>
    </View>
    <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.propCardBtn}>
      <Text style={styles.propCardBtnText}>View</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const MessageBubble = ({ message, onPropertyPress }: { message: Message; onPropertyPress: (id: string) => void }) => {
  const isAI = message.role === 'ai';
  return (
    <View style={[styles.messageRow, isAI ? styles.messageRowAI : styles.messageRowUser]}>
      {isAI && (
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>AI</Text>
        </LinearGradient>
      )}
      <View style={styles.bubbleColumn}>
        <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
          <Text style={[styles.bubbleText, isAI ? styles.bubbleTextAI : styles.bubbleTextUser]}>
            {message.text}
          </Text>
        </View>
        {isAI && message.properties && message.properties.length > 0 && (
          <View style={styles.propList}>
            {message.properties.map((p) => (
              <PropertyMiniCard key={p._id} property={p} onPress={() => onPropertyPress(p._id)} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Questionnaire Modal ──────────────────────────────────────────────────────

interface QuestionnaireModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (answers: Record<string, string>) => void;
}

const QuestionnaireModal = ({ visible, onClose, onComplete }: QuestionnaireModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fetchQuestions();
    }
  }, [visible]);

  const fetchQuestions = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setAnswers({});
    try {
      const res = await api.get('/ai/questionnaire/questions');
      setQuestions(res.data.questions || res.data || []);
    } catch {
      setQuestions([
        { _id: '1', key: 'budget', question: 'What is your budget range?', options: ['Under ₹50L', '₹50L–1Cr', '₹1Cr–2Cr', 'Above ₹2Cr'] },
        { _id: '2', key: 'propertyType', question: 'What type of property are you looking for?', options: ['2BHK', '3BHK', 'Villa', 'Studio'] },
        { _id: '3', key: 'location', question: 'Preferred location?', options: ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'] },
        { _id: '4', key: 'amenities', question: 'Must-have amenities?', options: ['Swimming Pool', 'Gym', 'Parking', 'Garden'] },
        { _id: '5', key: 'timeline', question: 'When do you plan to buy?', options: ['Immediately', 'Within 3 months', '3–6 months', 'Just exploring'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (key: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [key]: option }));
  };

  const slideNext = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: SCREEN_WIDTH, duration: 0, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    const current = questions[currentIndex];
    if (!answers[current.key]) return;
    if (currentIndex < questions.length - 1) {
      slideNext();
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    } else {
      onComplete(answers);
    }
  };

  const current = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.questionnaireContainer}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.questionnaireHeader}>
            <Text style={styles.questionnaireTitle}>Property Questionnaire</Text>
            <TouchableOpacity onPress={onClose} style={styles.questionnaireCloseBtn}>
              <Text style={styles.questionnaireCloseText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          {loading ? (
            <View style={styles.questionnaireLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
          ) : (
            <View style={styles.questionnaireBody}>
              {/* Progress bar */}
              <View style={styles.progressBarTrack}>
                <Animated.View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressLabel}>Question {currentIndex + 1} of {questions.length}</Text>

              {/* Question card */}
              <Animated.View style={[styles.questionCard, { transform: [{ translateX: slideAnim }] }]}>
                <Text style={styles.questionText}>{current?.question}</Text>
                <View style={styles.optionsGrid}>
                  {current?.options.map((opt) => {
                    const isSelected = answers[current.key] === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                        onPress={() => selectOption(current.key, opt)}
                        activeOpacity={0.8}
                      >
                        {isSelected ? (
                          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.optionChipGrad}>
                            <Text style={styles.optionTextSelected}>{opt}</Text>
                          </LinearGradient>
                        ) : (
                          <Text style={styles.optionText}>{opt}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>

              <TouchableOpacity
                style={[styles.nextBtn, !answers[current?.key] && styles.nextBtnDisabled]}
                onPress={handleNext}
                disabled={!answers[current?.key]}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={answers[current?.key] ? [COLORS.primary, COLORS.primaryDark] : ['#ccc', '#aaa']}
                  style={styles.nextBtnGrad}
                >
                  <Text style={styles.nextBtnText}>
                    {currentIndex === questions.length - 1 ? 'Find Properties ✨' : 'Next →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AIAssistantScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'ai',
      text: `Hello${user?.name ? ' ' + user.name.split(' ')[0] : ''}! 👋 I'm your AI Property Assistant. Ask me anything about properties, or use the smart suggestions below!`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/ai/suggestions');
      setSuggestions(res.data.suggestions || res.data || []);
    } catch {
      setSuggestions([
        { _id: '1', text: '2BHK under ₹80L in Pune' },
        { _id: '2', text: 'Luxury villas in Bangalore' },
        { _id: '3', text: 'New projects with gym & pool' },
        { _id: '4', text: '3BHK ready to move in Mumbai' },
        { _id: '5', text: 'Budget properties in Hyderabad' },
      ]);
    }
  };

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;
    const userMsg: Message = { id: uid(), role: 'user', text: query.trim(), timestamp: new Date() };
    setMessages((prev) => [userMsg, ...prev]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { query: query.trim() });
      const { message, properties } = res.data;
      const aiMsg: Message = {
        id: uid(),
        role: 'ai',
        text: message || 'Here are some properties matching your query:',
        properties: properties || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [aiMsg, ...prev]);
    } catch {
      const aiMsg: Message = {
        id: uid(),
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [aiMsg, ...prev]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleSuggestionPress = (text: string) => {
    sendMessage(text);
  };

  const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
    setShowQuestionnaire(false);
    setIsTyping(true);
    const summaryMsg: Message = {
      id: uid(),
      role: 'user',
      text: `🔍 Searching based on my preferences: ${Object.values(answers).join(', ')}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [summaryMsg, ...prev]);

    try {
      const res = await api.post('/ai/questionnaire', { answers });
      const { message, properties } = res.data;
      const aiMsg: Message = {
        id: uid(),
        role: 'ai',
        text: message || 'Based on your preferences, here are the best matches:',
        properties: properties || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [aiMsg, ...prev]);
    } catch {
      const aiMsg: Message = {
        id: uid(),
        role: 'ai',
        text: 'Sorry, I could not process your preferences right now.',
        timestamp: new Date(),
      };
      setMessages((prev) => [aiMsg, ...prev]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} onPropertyPress={(id) => router.push(`/property/${id}` as any)} />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiHeaderAvatar}>
            <Text style={styles.aiHeaderAvatarText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Property Assistant</Text>
            <Text style={styles.headerSubtitle}>Powered by AI • Always available</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={isTyping ? [{ id: '__typing__', role: 'ai', text: '', timestamp: new Date() } as Message, ...messages] : messages}
          renderItem={({ item }) =>
            item.id === '__typing__' ? (
              <View style={styles.typingRow}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </LinearGradient>
                <View style={[styles.bubble, styles.bubbleAI, { paddingVertical: 14 }]}>
                  <TypingDots />
                </View>
              </View>
            ) : (
              renderMessage({ item })
            )
          }
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Smart Suggestions */}
        <View style={styles.suggestionsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s._id}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(s.text)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionChipText}>✨ {s.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Ask AI button */}
        <TouchableOpacity
          style={styles.askAIBtn}
          onPress={() => setShowQuestionnaire(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.askAIGrad}>
            <Text style={styles.askAIText}>🎯 Ask AI to Find My Perfect Home</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about properties..."
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={inputText.trim() ? [COLORS.primary, COLORS.primaryDark] : ['#ccc', '#aaa']}
              style={styles.sendBtn}
            >
              <Text style={styles.sendBtnText}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        visible={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onComplete={handleQuestionnaireComplete}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiHeaderAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  aiHeaderAvatarText: { fontSize: 20 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Messages
  messagesList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  messageRow: { marginBottom: 16 },
  messageRowAI: { flexDirection: 'row', alignItems: 'flex-start' },
  messageRowUser: { flexDirection: 'row-reverse', alignItems: 'flex-start' },
  bubbleColumn: { flex: 1 },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  aiAvatarText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleAI: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 4,
    alignSelf: 'flex-start',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleUser: {
    backgroundColor: '#fff',
    borderTopRightRadius: 4,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextAI: { color: '#fff' },
  bubbleTextUser: { color: COLORS.text },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  typingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: 'rgba(255,255,255,0.7)' },

  // Property cards
  propList: { marginTop: 8, gap: 8 },
  propCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  propCardImage: { width: 80, height: 70 },
  propCardInfo: { flex: 1, paddingHorizontal: 10, paddingVertical: 8 },
  propCardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  propCardLocation: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  propCardPrice: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  propCardBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    marginRight: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  propCardBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Suggestions
  suggestionsWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
  },
  suggestionsContent: { paddingHorizontal: 16, gap: 8 },
  suggestionChip: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // Ask AI button
  askAIBtn: { marginHorizontal: 16, marginBottom: 8 },
  askAIGrad: {
    borderRadius: 14, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  askAIText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: COLORS.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Questionnaire Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  questionnaireContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  questionnaireHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  questionnaireTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  questionnaireCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  questionnaireCloseText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  questionnaireLoading: { padding: 48, alignItems: 'center', gap: 16 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14 },
  questionnaireBody: { padding: 20, paddingBottom: 36 },

  progressBarTrack: {
    height: 5, backgroundColor: COLORS.border,
    borderRadius: 3, marginBottom: 8,
  },
  progressBarFill: {
    height: 5, backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 20 },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  questionText: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 18, lineHeight: 24 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionChip: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  optionChipSelected: { borderColor: COLORS.primary },
  optionChipGrad: { paddingHorizontal: 16, paddingVertical: 10 },
  optionText: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, color: COLORS.text, fontWeight: '500' },
  optionTextSelected: { fontSize: 13, color: '#fff', fontWeight: '600' },

  nextBtn: { borderRadius: 16, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnGrad: { paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },
});
