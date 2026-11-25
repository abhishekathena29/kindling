import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CheckCircle2, RotateCcw, MessageSquare, Shield, Heart, TrendingUp, Target, Compass, Clock } from 'lucide-react-native';
import { FinalOutput } from '../engine/scoring';
import { generatePersonalizedPlan, JourneyFocus, WeeklyChallenge } from '../engine/planEngine';
import { RecommendationsWidget } from '../components/RecommendationsWidget';
import { Text } from '../components/Text';
import { AIPlanWeekItem } from '../types/aiPlan';
import { useAppContext } from '../context/AppContext';

interface PersonalizedPlanScreenProps {
  results: FinalOutput;
  onRetake: () => void;
  onViewResults: () => void;
}

const ICON_MAP = {
  message: MessageSquare,
  shield: Shield,
  heart: Heart,
  trend: TrendingUp,
  star: Target,
  sparkle: Compass,
  target: Target,
  compass: Compass,
};

const STYLE_LABELS = ['Authoritative', 'Authoritarian', 'Permissive', 'Neglectful'] as const;

const sanitizeStyleMentions = (value?: string) => {
  if (!value) return undefined;
  const cleaned = STYLE_LABELS.reduce(
    (text, label) => text.replace(new RegExp(label, 'gi'), ''),
    value,
  );
  const collapsed = cleaned.replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
  return collapsed || value;
};

export const PersonalizedPlanScreen: React.FC<PersonalizedPlanScreenProps> = ({ results, onRetake }) => {
  const { weeklyTasks, toggleWeeklyTaskStatus, progressSnapshot } = useAppContext();
  const plan = generatePersonalizedPlan(results);
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const aiPlan = results.aiPlan;

  // Prefer live weeklyTasks so Assessment matches Home/Profile after completions.
  const weekItems: (AIPlanWeekItem | WeeklyChallenge)[] = (
    weeklyTasks.length > 0
      ? weeklyTasks.map((task, index) => ({
          day: index + 1,
          title: task.title,
          description: task.description,
          actions: task.steps,
          time: '10 min',
          status:
            task.status === 'completed' ? 'done' : task.status === 'in_progress' ? 'active' : 'upcoming',
        }))
      : (aiPlan?.plans.week ?? plan.weeklyChallenges)
  ) as (AIPlanWeekItem | WeeklyChallenge)[];

  const statusByTitle = useMemo(() => {
    const map = new Map<string, 'done' | 'active' | 'upcoming'>();
    weeklyTasks.forEach(task => {
      const key = task.title.trim().toLowerCase();
      if (!key) return;
      map.set(
        key,
        task.status === 'completed' ? 'done' : task.status === 'in_progress' ? 'active' : 'upcoming',
      );
    });
    return map;
  }, [weeklyTasks]);

  const weeklyChallenges = weekItems.map((item, index) => {
    const key = item.title.trim().toLowerCase();
    const liveStatus = statusByTitle.get(key);
    return {
      day: item.day ?? index + 1,
      title: item.title,
      desc: 'description' in item ? item.description : item.desc,
      time: item.time ?? '10 min',
      status: (liveStatus ?? 'upcoming') as 'done' | 'active' | 'upcoming',
    };
  }).map((challenge, index, list) => {
    if (challenge.status === 'done') return challenge;
    const firstIncomplete = list.findIndex(c => c.status !== 'done');
    if (index === firstIncomplete) {
      return { ...challenge, status: 'active' as const };
    }
    return { ...challenge, status: 'upcoming' as const };
  });

  // Shared progress numbers — same source as Home + Profile.
  const done = progressSnapshot.completedChallenges;
  const total = Math.max(progressSnapshot.totalChallenges, weeklyChallenges.length || 5);
  const active = weeklyChallenges.filter(c => c.status === 'active').length;
  const upcoming = Math.max(0, total - done - active);
  const donePct = `${Math.round((done / total) * 100)}%`;
  const activePct = `${Math.round((active / total) * 100)}%`;
  const upcomingPct = `${Math.round((upcoming / total) * 100)}%`;
  const insightToday = sanitizeStyleMentions(aiPlan?.insights.today ?? plan.scoreRefinedInsight) ?? plan.scoreRefinedInsight;
  const insightWeekly = sanitizeStyleMentions(aiPlan?.insights.weekly ?? plan.secondaryInsight) ?? plan.secondaryInsight;
  const todayPlanActions = aiPlan?.plans.today.actions ?? [];
  const exercises = aiPlan?.exercises ?? [];
  const planTitle = 'Your Parenting Journey';
  const planSubtitle = sanitizeStyleMentions(aiPlan?.insights.weekly ?? plan.subtitle) ?? plan.subtitle;

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.headerSuper}>Your Plan</Text>
        <Text style={styles.headerTitle}>{planTitle}</Text>
        <Text style={styles.headerSubtitle}>{planSubtitle}</Text>

        {/* Assessment Card */}
        <View style={styles.assessmentCard}>
          <View style={styles.assessmentHeader}>
            <View style={styles.checkIconBg}>
              <CheckCircle2 size={24} color="#38A389" />
            </View>
            <View>
              <Text style={styles.assessmentTitle}>Assessment Complete</Text>
              <Text style={styles.assessmentDate}>{todayDate}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.retakeBtn} onPress={onRetake}>
            <RotateCcw size={14} color="#666666" style={{ marginRight: 6 }} />
            <Text style={styles.retakeText}>Retake Assessment</Text>
          </TouchableOpacity>
        </View>

        {/* Score-Aware Insight */}
        <View style={styles.scoreInsightCard}>
          <Text style={styles.scoreInsightTitle}>Your Personalised Insight</Text>
          <Text style={styles.scoreInsightText}>{insightToday}</Text>
        </View>

        {/* Your Personalized Journey */}
        <Text style={styles.sectionTitle}>Your Personalized Journey</Text>
        {plan.journeyFocuses.map((focus: JourneyFocus, i: number) => {
          const IconComp = ICON_MAP[focus.iconType];
          return (
            <View key={i} style={[styles.journeyCard, { backgroundColor: focus.bgColor }]}> 
              <IconComp size={20} color="#666" style={styles.journeyIcon} />
              <View style={styles.journeyTextCont}>
                <Text style={styles.journeyTitle}>{focus.title}</Text>
                <Text style={styles.journeyDesc}>{focus.desc}</Text>
              </View>
            </View>
          );
        })}

        {/* Analysis */}
        <Text style={styles.sectionTitle}>Your Detailed Analysis</Text>
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>Parenting approach insights</Text>
          <Text style={styles.analysisDesc}>{plan.analysisSummary}</Text>
        </View>
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>What Research Says</Text>
          <Text style={styles.analysisDesc}>{insightWeekly}</Text>
        </View>

        {aiPlan?.plans.today && (
          <>
            <Text style={styles.sectionTitle}>Today’s Plan</Text>
            <View style={styles.todayPlanCard}>
              <Text style={styles.todayPlanTitle}>{aiPlan.plans.today.title}</Text>
              {todayPlanActions.length > 0 ? (
                todayPlanActions.map((action, idx) => {
                  const isDone = statusByTitle.get(action.trim().toLowerCase()) === 'done';
                  return (
                    <View key={`${action}-${idx}`} style={styles.todayPlanActionRow}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View style={styles.todayPlanBullet} />
                        <Text style={[styles.todayPlanActionText, isDone && styles.completedText]}>{action}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.markCompleteBtn, isDone && styles.markCompleteBtnDone]}
                        onPress={() => toggleWeeklyTaskStatus(action)}
                      >
                        <Text style={[styles.markCompleteBtnText, isDone && styles.markCompleteBtnTextDone]}>
                          {isDone ? 'Completed ✓' : 'Complete Challenge'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.todayPlanActionText}>We’ll add actions here once AI responds.</Text>
              )}
            </View>
          </>
        )}

        {/* This Week's Challenges */}
        <Text style={styles.sectionTitle}>This Week's Challenges</Text>
        {weeklyChallenges.map((challenge) => {
          const isDone = challenge.status === 'done';
          return (
            <View key={challenge.day} style={styles.challengeCard}>
              <TouchableOpacity
                style={[
                  styles.challengeStatusIcon,
                  isDone ? { backgroundColor: '#E4F4ED' } :
                  challenge.status === 'active' ? { backgroundColor: '#FDECE1' } :
                  { backgroundColor: '#F5F5F5' }
                ]}
                onPress={() => toggleWeeklyTaskStatus(challenge.title)}
              >
                <View style={[
                  styles.challengeStatusInner,
                  isDone ? { borderColor: '#38A389', backgroundColor: '#38A389' } :
                  challenge.status === 'active' ? { borderColor: '#ED8D41' } :
                  { borderColor: '#CCCCCC' }
                ]} />
              </TouchableOpacity>
              <View style={styles.challengeTextCont}>
                <Text style={[styles.challengeTitle, isDone && styles.completedText]}>Day {challenge.day}: {challenge.title}</Text>
                <Text style={styles.challengeDesc}>{challenge.desc}</Text>
                <View style={styles.challengeCardFooter}>
                  <View style={styles.timeTag}>
                    <Clock size={12} color="#38A389" />
                    <Text style={styles.timeText}>{challenge.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.markCompleteBtn, isDone && styles.markCompleteBtnDone]}
                    onPress={() => toggleWeeklyTaskStatus(challenge.title)}
                  >
                    <Text style={[styles.markCompleteBtnText, isDone && styles.markCompleteBtnTextDone]}>
                      {isDone ? 'Completed ✓' : 'Complete Challenge'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Challenge Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.listSectionTitle}>Challenge Progress</Text>
          <Text style={styles.progressSummary}>
            {done}/{total} completed · {Math.round((done / total) * 100)}%
          </Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStatCol}>
              <Text style={[styles.progressStatNum, { color: '#38A389' }]}>{done}</Text>
              <Text style={styles.progressStatLabel}>Done</Text>
            </View>
            <View style={styles.progressStatCol}>
              <Text style={[styles.progressStatNum, { color: '#ED8D41' }]}>{active}</Text>
              <Text style={styles.progressStatLabel}>Active</Text>
            </View>
            <View style={styles.progressStatCol}>
              <Text style={[styles.progressStatNum, { color: '#666666' }]}>{upcoming}</Text>
              <Text style={styles.progressStatLabel}>Upcoming</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: donePct as any, backgroundColor: '#38A389' }]} />
            <View style={[styles.progressBarFill, { width: activePct as any, backgroundColor: '#ED8D41' }]} />
            <View style={[styles.progressBarFill, { width: upcomingPct as any, backgroundColor: '#EEEEEE' }]} />
          </View>
        </View>

        {exercises.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <View style={styles.exerciseRow}>
              {exercises.map((exercise, index) => (
                <View key={`${exercise}-${index}`} style={styles.exerciseChip}>
                  <Text style={styles.exerciseText}>{exercise}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <RecommendationsWidget />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { padding: 24, paddingBottom: 100 },
  headerSuper: { fontSize: 13, fontWeight: '600', color: '#38A389', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#222222', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: '#666666', marginBottom: 24, lineHeight: 20 },

  assessmentCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  assessmentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E4F4ED', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  assessmentTitle: { fontSize: 16, fontWeight: '600', color: '#222222', marginBottom: 4 },
  assessmentDate: { fontSize: 13, color: '#666666' },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  retakeText: { color: '#666666', fontSize: 13, fontWeight: '500' },

  scoreInsightCard: { backgroundColor: '#E4F4ED', borderRadius: 16, padding: 20, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#38A389' },
  scoreInsightTitle: { fontSize: 13, fontWeight: '700', color: '#38A389', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreInsightText: { fontSize: 14, color: '#444444', lineHeight: 22 },

  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#222222', marginTop: 8, marginBottom: 16 },

  journeyCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12 },
  journeyIcon: { marginRight: 16 },
  journeyTextCont: { flex: 1 },
  journeyTitle: { fontSize: 15, fontWeight: '600', color: '#222222', marginBottom: 2 },
  journeyDesc: { fontSize: 13, color: '#666666' },

  analysisCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  analysisTitle: { fontSize: 15, fontWeight: '600', color: '#222222', marginBottom: 8 },
  analysisDesc: { fontSize: 13, color: '#666666', lineHeight: 20 },

  challengeCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  challengeStatusIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16, marginTop: 2 },
  challengeStatusInner: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, backgroundColor: 'transparent' },
  challengeTextCont: { flex: 1 },
  challengeTitle: { fontSize: 15, fontWeight: '600', color: '#222222', marginBottom: 6 },
  challengeDesc: { fontSize: 13, color: '#666666', lineHeight: 18, marginBottom: 10 },
  timeTag: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 11, color: '#38A389', fontWeight: '500', marginLeft: 4 },

  listSectionTitle: { fontSize: 16, fontWeight: '700', color: '#222222', marginBottom: 8 },
  progressSummary: { fontSize: 13, color: '#666666', marginBottom: 16 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  progressStats: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  progressStatCol: { alignItems: 'center' },
  progressStatNum: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  progressStatLabel: { fontSize: 11, color: '#666666', textTransform: 'uppercase' },
  progressBarContainer: { height: 6, borderRadius: 3, flexDirection: 'row', overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  todayPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  todayPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 12,
  },
  todayPlanAction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  todayPlanBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38A389',
    marginTop: 8,
    marginRight: 10,
  },
  todayPlanActionText: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  exerciseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  exerciseChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  exerciseText: {
    fontSize: 13,
    color: '#444444',
  },
  metadataText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  challengeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  todayPlanActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  markCompleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E4F4ED',
    borderWidth: 1,
    borderColor: '#38A389',
  },
  markCompleteBtnDone: {
    backgroundColor: '#38A389',
    borderColor: '#38A389',
  },
  markCompleteBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38A389',
  },
  markCompleteBtnTextDone: {
    color: '#FFFFFF',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
});
