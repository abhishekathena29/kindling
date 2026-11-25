import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Flame, BookOpen, TrendingUp, ChevronLeft, ChevronRight, Calendar, Users, User } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { PlanCardModal, PlanCardData } from '../components/PlanCardModal';
import { RecommendationsWidget } from '../components/RecommendationsWidget';
import { supabase } from '../lib/supabase';
import { Text } from '../components/Text';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigate?: (tab: string) => void;
}

export const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const {
    assessmentHistory,
    weeklyTasks,
    progressSnapshot,
    setShowNotifications,
    setAIModalVisible,
    setAIDraftMessage,
    updateWeeklyTaskStatus,
    toggleWeeklyTaskStatus,
    setCalendarModalVisible,
  } = useAppContext();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanCardData | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        if (data?.name) setUserName(data.name);
        else setUserName(user.email?.split('@')[0] || 'Parent');
      } catch {
        setUserName('Parent');
      }
    };
    fetchUserName();
  }, []);

  const today = new Date();
  const currentWeek: { label: string; date: number; isToday: boolean }[] = [];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i + weekOffset * 7);
    currentWeek.push({
      label: weekDays[d.getDay()],
      date: d.getDate(),
      isToday: i === 0 && weekOffset === 0,
    });
  }

  const startWeek = new Date(today);
  startWeek.setDate(today.getDate() - 3 + weekOffset * 7);
  const endWeek = new Date(today);
  endWeek.setDate(today.getDate() + 3 + weekOffset * 7);

  const startStr = startWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const { completedChallenges, totalChallenges, streakDays } = progressSnapshot;
  const weekProgress = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

  const goToPlan = () => onNavigate?.('Assessment');
  const goToChannels = () => onNavigate?.('Channels');
  const goToProfile = () => onNavigate?.('Profile');

  const showProgressAlert = () => {
    const completedText = `${completedChallenges}/${totalChallenges}`;
    const progressText = totalChallenges > 0 ? `${weekProgress}%` : '0%';
    Alert.alert(
      'Progress',
      `You have completed ${completedText} challenges this week (${progressText}). Keep going!`,
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
            <Text style={styles.greetingText}>{userName || 'Parent'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellButton} onPress={() => setShowNotifications(true)}>
              <Bell size={24} color="#222222" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
              <User size={22} color="#38A389" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Context Banner */}
        {assessmentHistory.length > 0 ? (
          <TouchableOpacity style={styles.planBanner} activeOpacity={0.8} onPress={goToPlan}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.planBannerTitle}>Your Parenting Journey, Step by Step</Text>
              <Text style={styles.planBannerSubtitle}>Bonding starts with small moments. Try today's tip when you get a quiet minute.</Text>
            </View>
            <View style={styles.avatarStack}>
              <Users size={28} color="#38A389" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.assessmentBanner} activeOpacity={0.8} onPress={goToPlan}>
            <Text style={styles.assessmentBannerTitle}>Parenting Style Assessment</Text>
            <Text style={styles.assessmentBannerSubtitle}>Discover your parenting style through a quick 20-question quiz. Get personalized weekly plans based on your results.</Text>
            <View style={styles.startBadgeBtn}>
              <Text style={styles.startBadgeText}>Start New Assessment</Text>
              <ChevronRight size={14} color="#FFF" style={{ marginTop: 1, marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        )}

        {/* Today's Plan */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          <TouchableOpacity style={styles.seeAllBtn} onPress={goToPlan}>
            <Text style={styles.seeAllText}>See All </Text>
            <ChevronRight size={12} color="#38A389" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.planScroll}>
          {weeklyTasks.map((plan) => {
            const isCompleted = plan.status === 'completed';
            return (
              <View key={plan.id} style={styles.planCard}>
                <TouchableOpacity style={{ alignItems: 'center', width: '100%' }} onPress={() => setSelectedPlan(plan)}>
                  <View style={[styles.planIconBg, { backgroundColor: plan.iconBg }]}>
                    <plan.Icon size={20} color="#777777" />
                  </View>
                  <Text style={[styles.planCardText, isCompleted && styles.completedText]} numberOfLines={2}>{plan.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.homeMarkBtn, isCompleted && styles.homeMarkBtnDone]}
                  onPress={() => toggleWeeklyTaskStatus(plan.id)}
                >
                  <Text style={[styles.homeMarkBtnText, isCompleted && styles.homeMarkBtnTextDone]}>
                    {isCompleted ? 'Done ✓' : 'Complete Challenge'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Date Strip & Calendar Launch */}
        <View style={styles.dateStrip}>
          <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ChevronLeft size={16} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCalendarModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={14} color="#38A389" style={{ marginRight: 6 }} />
            <Text style={styles.dateRangeText}>{startStr} – {endStr}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ChevronRight size={16} color="#666666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.calendarStrip} onPress={() => setCalendarModalVisible(true)}>
          {currentWeek.map((item, i) => (
            <View key={i} style={styles.calendarDay}>
              <Text style={styles.calDayText}>{item.label}</Text>
              <View style={[styles.calDateContainer, item.isToday && styles.activeCalDate]}>
                <Text style={[styles.calDateText, item.isToday && { color: '#FFF' }]}>{item.date}</Text>
              </View>
            </View>
          ))}
        </TouchableOpacity>

        {/* Weekly Tasks Focus */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week's Focus</Text>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => onNavigate?.('Reflect')}>
            <Text style={styles.seeAllText}>Reflect </Text>
            <ChevronRight size={12} color="#38A389" />
          </TouchableOpacity>
        </View>
        <View style={styles.weekTaskList}>
          {weeklyTasks.map(task => {
            const isDone = task.status === 'completed';
            return (
              <View key={task.id} style={styles.weekTaskRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[styles.weekTaskTitle, isDone && styles.completedText]}>{task.title}</Text>
                  <Text style={styles.weekTaskDetail}>{task.description}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.homeRowMarkBtn, isDone && styles.homeRowMarkBtnDone]}
                  onPress={() => toggleWeeklyTaskStatus(task.id)}
                >
                  <Text style={[styles.homeRowMarkBtnText, isDone && styles.homeRowMarkBtnTextDone]}>
                    {isDone ? 'Completed ✓' : 'Complete Challenge'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.reflectCta} onPress={() => onNavigate?.('Reflect')}>
          <BookOpen size={18} color="#38A389" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.reflectCtaTitle}>Weekly Reflection</Text>
            <Text style={styles.reflectCtaSub}>Share feedback to unlock next week’s challenges</Text>
          </View>
          <ChevronRight size={16} color="#38A389" />
        </TouchableOpacity>

        {/* This Week */}
        <View style={styles.thisWeekContainer}>
          <View style={styles.thisWeekHeader}>
            <TrendingUp size={20} color="#38A389" />
            <Text style={styles.thisWeekTitle}>This Week</Text>
          </View>
          
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statBox} onPress={goToPlan}>
              <View style={styles.statIconWrapper}>
                <View style={styles.statIconCircle}><Text style={{ color: '#38A389', fontSize: 10 }}>✓</Text></View>
              </View>
              <Text style={styles.statValue}>
                {completedChallenges}/{totalChallenges}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={goToProfile}>
              <Flame size={16} color="#ED8D41" />
              <Text style={styles.statValue}>{streakDays} days</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={showProgressAlert}>
              <TrendingUp size={16} color="#3A82F6" />
              <Text style={styles.statValue}>{weekProgress}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.segmentedControl}>
            <TouchableOpacity style={[styles.segment, { backgroundColor: '#FAE4D2' }]} onPress={goToPlan}>
              <Text style={styles.segmentTextActive}>Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segment, { backgroundColor: '#F2E8FD' }]} onPress={goToChannels}>
              <Text style={styles.segmentTextActive}>Channels</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segment, { backgroundColor: '#DEF3E6' }]} onPress={showProgressAlert}>
              <Text style={styles.segmentTextActive}>Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        <RecommendationsWidget />
      </ScrollView>

      <PlanCardModal
        visible={!!selectedPlan}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onMarkComplete={(id) => {
          updateWeeklyTaskStatus(id, 'completed');
          setSelectedPlan(null);
        }}
        onAskAI={(prompt) => {
          setSelectedPlan(null);
          setAIDraftMessage(prompt);
          setAIModalVisible(true);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  dateText: { fontSize: 14, color: '#666666', marginBottom: 4 },
  greetingText: { fontSize: 26, fontWeight: '700', color: '#222222' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  bellButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E54B4B', borderWidth: 2, borderColor: '#FAFAFA' },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D8EDE4', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  
  planBanner: { backgroundColor: '#E4F4ED', marginHorizontal: 24, borderRadius: 24, padding: 24, marginBottom: 32, flexDirection: 'row', alignItems: 'center' },
  planBannerTitle: { fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 8 },
  planBannerSubtitle: { fontSize: 13, color: '#666666', lineHeight: 20 },
  avatarStack: { width: 50, height: 50, backgroundColor: '#D8EDE4', borderRadius: 12, borderWidth: 2, borderColor: '#38A389', justifyContent: 'center', alignItems: 'center' },
  
  assessmentBanner: { backgroundColor: '#F0F7F4', marginHorizontal: 24, borderRadius: 24, padding: 24, marginBottom: 32 },
  assessmentBannerTitle: { fontSize: 18, fontWeight: '700', color: '#2C3E50', marginBottom: 8 },
  assessmentBannerSubtitle: { fontSize: 13, color: '#546E7A', lineHeight: 20, marginBottom: 16 },
  startBadgeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#38A389', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  startBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#222222' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#38A389' },
  
  planScroll: { paddingHorizontal: 20, paddingBottom: 16 },
  planCard: { width: width * 0.32, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginHorizontal: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  planIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  planCardText: { fontSize: 14, fontWeight: '600', color: '#222222', textAlign: 'center' },
  planStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38A389',
    marginTop: 6,
  },
  
  dateStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  dateRangeText: { fontSize: 13, fontWeight: '600', color: '#666666' },

  calendarStrip: { flexDirection: 'row', paddingHorizontal: 24, justifyContent: 'space-between', backgroundColor: '#FFFFFF', marginHorizontal: 24, paddingVertical: 16, borderRadius: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  calendarDay: { alignItems: 'center' },
  calDayText: { fontSize: 12, color: '#888888', marginBottom: 8 },
  calDateContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  activeCalDate: { backgroundColor: '#38A389' },
  calDateText: { fontSize: 14, fontWeight: '600', color: '#222222' },
  
  thisWeekContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginHorizontal: 24, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  thisWeekHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  thisWeekTitle: { fontSize: 18, fontWeight: '600', color: '#222222', marginLeft: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#FAFAFA', borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  statIconWrapper: { marginBottom: 4 },
  statIconCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#38A389', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#222222', marginVertical: 4 },
  statLabel: { fontSize: 11, color: '#777777' },
  segmentedControl: { flexDirection: 'row', justifyContent: 'space-between' },
  segment: { flex: 1, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  segmentTextActive: { fontSize: 13, fontWeight: '600', color: '#222222' },
  weekTaskList: { marginHorizontal: 24, marginBottom: 24 },
  weekTaskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  weekTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  weekTaskDetail: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    maxWidth: '75%',
  },
  weekTaskStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ED8D41',
  },
  weekTaskStatusDone: {
    color: '#38A389',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  homeMarkBtn: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E4F4ED',
    borderWidth: 1,
    borderColor: '#38A389',
    alignItems: 'center',
    width: '100%',
  },
  homeMarkBtnDone: {
    backgroundColor: '#38A389',
  },
  homeMarkBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#38A389',
  },
  homeMarkBtnTextDone: {
    color: '#FFFFFF',
  },
  homeRowMarkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E4F4ED',
    borderWidth: 1,
    borderColor: '#38A389',
    alignSelf: 'center',
  },
  homeRowMarkBtnDone: {
    backgroundColor: '#38A389',
  },
  homeRowMarkBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38A389',
  },
  homeRowMarkBtnTextDone: {
    color: '#FFFFFF',
  },
  reflectCta: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4F4ED',
  },
  reflectCtaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  reflectCtaSub: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
});
