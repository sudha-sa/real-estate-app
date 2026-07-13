import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePropertyStore } from '../../../stores/propertyStore';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StageStatus = 'Completed' | 'In Progress' | 'Upcoming';

interface Stage {
  number: number;
  icon: string;
  title: string;
  status: StageStatus;
  description?: string;
}

const STAGE_DEFINITIONS: Omit<Stage, 'status'>[] = [
  { number: 1, icon: '🏗️', title: 'Foundation & Excavation', description: 'Site clearing, excavation, and foundation work' },
  { number: 2, icon: '🧱', title: 'Structure & Framework', description: 'Columns, beams, slabs, and structural walls' },
  { number: 3, icon: '🪟', title: 'Brickwork & Masonry', description: 'External and internal brick/block work' },
  { number: 4, icon: '🔌', title: 'MEP Installation', description: 'Electrical, plumbing, and HVAC rough-in work' },
  { number: 5, icon: '🪣', title: 'Plastering & Finishing', description: 'Interior/exterior plastering, flooring, painting' },
  { number: 6, icon: '🏡', title: 'Handover Ready', description: 'Final inspections, snag fixing, and possession' },
];

const deriveStages = (completionPercent: number): Stage[] => {
  const completedCount = Math.floor((completionPercent / 100) * STAGE_DEFINITIONS.length);
  const inProgressIndex = completedCount < STAGE_DEFINITIONS.length ? completedCount : -1;

  return STAGE_DEFINITIONS.map((s, i) => {
    let status: StageStatus = 'Upcoming';
    if (i < completedCount) status = 'Completed';
    else if (i === inProgressIndex) status = 'In Progress';
    return { ...s, status };
  });
};

const STATUS_CONFIG: Record<StageStatus, { color: string; bg: string; icon: string }> = {
  'Completed': { color: COLORS.success, bg: '#D1FAE5', icon: '✅' },
  'In Progress': { color: COLORS.primary, bg: '#EEF2FF', icon: '🔄' },
  'Upcoming': { color: COLORS.textSecondary || '#6B7280', bg: '#F3F4F6', icon: '🔒' },
};

// ─── Spinning Animation for In Progress ──────────────────────────────────────
const SpinningIcon = () => {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2200, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.Text style={{ transform: [{ rotate }], fontSize: 18 }}>🔄</Animated.Text>;
};

// ─── Animated Progress Bar ───────────────────────────────────────────────────
const AnimatedProgressBar = ({ percent }: { percent: number }) => {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.min(Math.max(percent, 0), 100),
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const widthInterpolated = width.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFillWrapper, { width: widthInterpolated as any }]}>
        <LinearGradient
          colors={[COLORS.primary, '#6B8EFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={[styles.progressKnob, { left: `${percent}%` as any }]} />
    </View>
  );
};

// ─── Stage Card ───────────────────────────────────────────────────────────────
const StageCard = ({ stage, isLast }: { stage: Stage; isLast: boolean }) => {
  const config = STATUS_CONFIG[stage.status];
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = (stage.number - 1) * 120;
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}>
      <View style={styles.stageRow}>
        {/* Timeline column */}
        <View style={styles.timelineCol}>
          <View style={[styles.stageCircle, { backgroundColor: config.bg, borderColor: config.color }]}>
            <Text style={[styles.stageNumber, { color: config.color }]}>{stage.number}</Text>
          </View>
          {!isLast && (
            <View style={[styles.timelineLine, stage.status === 'Completed' && styles.timelineLineDone]} />
          )}
        </View>
        {/* Content */}
        <View style={[styles.stageCard, { borderLeftColor: config.color }]}>
          <View style={styles.stageCardHeader}>
            <Text style={styles.stageIcon}>{stage.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              {stage.description && (
                <Text style={styles.stageDesc}>{stage.description}</Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
              {stage.status === 'In Progress' ? (
                <SpinningIcon />
              ) : (
                <Text style={{ fontSize: 14 }}>{config.icon}</Text>
              )}
              <Text style={[styles.statusText, { color: config.color }]}>{stage.status}</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ConstructionProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedProperty, isLoading, fetchPropertyById } = usePropertyStore();

  useEffect(() => {
    if (id && !selectedProperty) fetchPropertyById(id);
  }, [id]);

  const property = selectedProperty;
  const progress = property?.constructionProgress?.completionPercent ?? 52;
  const startDate = property?.constructionProgress?.startDate ?? 'Jan 2023';
  const endDate = property?.constructionProgress?.expectedEndDate ?? 'Dec 2025';
  const stages = deriveStages(progress);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <LinearGradient
        colors={[COLORS.primary, '#6B8EFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack} activeOpacity={0.8}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Construction Progress</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Overview Card ── */}
        <View style={styles.overviewCard}>
          <LinearGradient
            colors={['#EEF2FF', '#F5F7FF']}
            style={styles.overviewGrad}
          >
            <Text style={styles.overviewTitle}>
              {property?.title ?? 'Property Overview'}
            </Text>
            <View style={styles.overviewDates}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>🗓 Start Date</Text>
                <Text style={styles.dateValue}>{startDate}</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>🏁 Expected End</Text>
                <Text style={styles.dateValue}>{endDate}</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>📊 Completion</Text>
                <Text style={[styles.dateValue, { color: COLORS.primary }]}>{progress}%</Text>
              </View>
            </View>

            {/* Animated progress bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabelText}>Overall Progress</Text>
                <Text style={styles.progressLabelPct}>{progress}%</Text>
              </View>
              <AnimatedProgressBar percent={progress} />
              <View style={styles.progressStageLabels}>
                <Text style={styles.progressStageLabelText}>Foundation</Text>
                <Text style={styles.progressStageLabelText}>Handover</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Stage Legend ── */}
        <View style={styles.legendRow}>
          {(['Completed', 'In Progress', 'Upcoming'] as StageStatus[]).map(s => (
            <View key={s} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_CONFIG[s].color }]} />
              <Text style={styles.legendText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* ── Stages Timeline ── */}
        <View style={styles.stagesContainer}>
          <Text style={styles.stagesTitle}>Construction Stages</Text>
          {stages.map((stage, i) => (
            <StageCard key={stage.number} stage={stage} isLast={i === stages.length - 1} />
          ))}
        </View>

        {/* ── Info Footer ── */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoFooterIcon}>ℹ️</Text>
          <Text style={styles.infoFooterText}>
            Construction timelines are estimates. Actual progress may vary based on weather and regulatory approvals.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 18, paddingHorizontal: 16,
  },
  headerBack: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerBackIcon: { fontSize: 20, color: '#fff' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#fff' },

  scrollContent: { paddingBottom: 20 },

  // Overview
  overviewCard: { margin: 16, borderRadius: 24, overflow: 'hidden', ...SHADOWS.medium },
  overviewGrad: { padding: 20 },
  overviewTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 18 },
  overviewDates: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dateItem: { flex: 1, alignItems: 'center', gap: 5 },
  dateLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  dateValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  dateDivider: { width: 1, height: 36, backgroundColor: COLORS.border || '#E8ECFF' },

  progressSection: {},
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabelText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  progressLabelPct: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  progressTrack: {
    height: 14, backgroundColor: COLORS.border || '#E8ECFF',
    borderRadius: 7, overflow: 'hidden', position: 'relative',
  },
  progressFillWrapper: { height: 14, borderRadius: 7, overflow: 'hidden' },
  progressKnob: {
    position: 'absolute', top: -3, width: 20, height: 20,
    borderRadius: 10, backgroundColor: COLORS.primary,
    borderWidth: 3, borderColor: '#fff',
    marginLeft: -10,
    ...SHADOWS.small,
  },
  progressStageLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 6,
  },
  progressStageLabelText: { fontSize: 11, color: COLORS.textSecondary },

  // Legend
  legendRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 20,
    marginBottom: 8, paddingHorizontal: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },

  // Stages
  stagesContainer: { paddingHorizontal: 16, paddingTop: 8 },
  stagesTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  stageRow: { flexDirection: 'row', marginBottom: 4 },
  timelineCol: { width: 48, alignItems: 'center' },
  stageCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, zIndex: 2,
  },
  stageNumber: { fontSize: 15, fontWeight: '800' },
  timelineLine: {
    flex: 1, width: 2.5, minHeight: 32,
    backgroundColor: COLORS.border || '#E8ECFF',
    marginVertical: 3,
  },
  timelineLineDone: { backgroundColor: COLORS.success },
  stageCard: {
    flex: 1, marginLeft: 12, marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 18, padding: 14,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  stageCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stageIcon: { fontSize: 26, marginTop: 2 },
  stageTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4, flex: 1 },
  stageDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  // Info footer
  infoFooter: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    margin: 16, padding: 14,
    backgroundColor: '#FEF3C7', borderRadius: 16,
  },
  infoFooterIcon: { fontSize: 16, marginTop: 1 },
  infoFooterText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
});
