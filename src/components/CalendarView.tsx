import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen, Clock } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { Text } from './Text';

const startOfWeekMonday = (date: Date) => {
  const copy = new Date(date);
  const weekday = copy.getDay();
  const diff = (weekday + 6) % 7; // Monday start
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const CalendarView: React.FC = () => {
  const {
    isCalendarModalVisible,
    setCalendarModalVisible,
    weeklyTasks,
    toggleWeeklyTaskStatus,
    setReflectionModalVisible,
    monthlyReflections,
    progressSnapshot,
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
    // Recompute "today" each time the calendar is opened so it never goes stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalendarModalVisible]);

  const weekStart = useMemo(() => startOfWeekMonday(today), [today]);

  // Map this week's tasks onto Mon–Fri (or first N days of the week).
  const tasksByDateKey = useMemo(() => {
    const map = new Map<string, typeof weeklyTasks>();
    weeklyTasks.forEach((task, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);
      const key = toKey(day);
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, task]);
    });
    return map;
  }, [weeklyTasks, weekStart]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + Math.max(weeklyTasks.length - 1, 0));
    return end;
  }, [weekStart, weeklyTasks.length]);

  const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  const selectedDateStr = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const selectedDayTasks = tasksByDateKey.get(toKey(selectedDate)) ?? [];
  const isSelectedInThisWeek =
    selectedDate >= weekStart && selectedDate <= weekEnd && weeklyTasks.length > 0;

  const completedCount = progressSnapshot.completedChallenges;
  const totalCount = Math.max(progressSnapshot.totalChallenges, weeklyTasks.length || 0);
  const lastReflectionLabel = monthlyReflections[0]?.periodLabel;

  return (
    <Modal visible={isCalendarModalVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconBg}>
              <CalendarIcon size={22} color="#38A389" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Parenting Calendar</Text>
              <Text style={styles.headerSubtitle}>This week’s tasks · Reflect for next week</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCalendarModalVisible(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.reflectionBanner}
            onPress={() => {
              setCalendarModalVisible(false);
              setReflectionModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.reflectionBannerLeft}>
              <View style={styles.sparkleCircle}>
                <BookOpen size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reflectionBannerTitle}>Weekly Reflection Due</Text>
                <Text style={styles.reflectionBannerSub}>
                  {lastReflectionLabel
                    ? `Last logged: ${lastReflectionLabel}. Tap to reflect & generate next week’s challenges.`
                    : 'Finish this week, then reflect to unlock next week’s challenges.'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => setCurrentMonthOffset(m => m - 1)}>
              <ChevronLeft size={20} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthName}</Text>
            <TouchableOpacity onPress={() => setCurrentMonthOffset(m => m + 1)}>
              <ChevronRight size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {daysArray.map((dayNum, index) => {
              if (dayNum === null) {
                return <View key={`empty-${index}`} style={styles.emptyDayCell} />;
              }

              const cellDate = new Date(
                currentMonthDate.getFullYear(),
                currentMonthDate.getMonth(),
                dayNum,
              );
              cellDate.setHours(0, 0, 0, 0);
              const isToday = sameDay(cellDate, today);
              const isSelected = sameDay(cellDate, selectedDate);
              const hasTask = tasksByDateKey.has(toKey(cellDate));
              const isReflectionAnchor =
                dayNum === daysInMonth &&
                currentMonthDate.getMonth() === today.getMonth() &&
                currentMonthDate.getFullYear() === today.getFullYear();

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    isSelected && !isToday && styles.selectedCell,
                    isReflectionAnchor && styles.reflectionCell,
                  ]}
                  onPress={() => setSelectedDate(cellDate)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday && styles.todayDayText,
                      isReflectionAnchor && !isToday && styles.reflectionDayText,
                    ]}
                  >
                    {dayNum}
                  </Text>
                  {hasTask ? (
                    <View style={styles.taskDotRow}>
                      <View style={[styles.taskDot, isToday && styles.taskDotOnToday]} />
                    </View>
                  ) : isReflectionAnchor ? (
                    <View style={styles.reflectionDot} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.selectedDaySection}>
            <View style={styles.selectedDayHeader}>
              <Text style={styles.selectedDayTitle}>Daily Tasks ({selectedDateStr})</Text>
              <Text style={styles.progressCounterText}>
                {completedCount}/{totalCount} This Week
              </Text>
            </View>

            {!isSelectedInThisWeek ? (
              <View style={styles.emptyTasksCard}>
                <Text style={styles.emptyTasksText}>
                  Challenges are scheduled for this week only. Reflect to generate next week’s plan.
                </Text>
              </View>
            ) : selectedDayTasks.length === 0 ? (
              <View style={styles.emptyTasksCard}>
                <Text style={styles.emptyTasksText}>No challenge assigned to this day.</Text>
              </View>
            ) : (
              selectedDayTasks.map(task => {
                const isDone = task.status === 'completed';
                return (
                  <View key={task.id} style={styles.taskCard}>
                    <TouchableOpacity
                      style={styles.checkTouchable}
                      onPress={() => toggleWeeklyTaskStatus(task.id)}
                    >
                      {isDone ? (
                        <CheckCircle2 size={24} color="#38A389" />
                      ) : (
                        <Circle size={24} color="#CCCCCC" />
                      )}
                    </TouchableOpacity>
                    <View style={styles.taskDetails}>
                      <Text style={[styles.taskTitle, isDone && styles.completedTitle]}>{task.title}</Text>
                      <Text style={styles.taskDescription}>{task.description}</Text>
                      <View style={styles.timeRow}>
                        <Clock size={12} color="#38A389" />
                        <Text style={styles.timeText}>10 min focus</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.markBtn, isDone && styles.markBtnDone]}
                      onPress={() => toggleWeeklyTaskStatus(task.id)}
                    >
                      <Text style={[styles.markBtnText, isDone && styles.markBtnTextDone]}>
                        {isDone ? 'Done ✓' : 'Complete'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E4F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222222' },
  headerSubtitle: { fontSize: 12, color: '#666666' },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { padding: 20, paddingBottom: 60 },
  reflectionBanner: {
    backgroundColor: '#38A389',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  reflectionBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  sparkleCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reflectionBannerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  reflectionBannerSub: { fontSize: 12, color: '#E4F4ED', lineHeight: 16 },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#222222' },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: { fontSize: 12, fontWeight: '600', color: '#999999', width: 36, textAlign: 'center' },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyDayCell: { width: '14.28%', height: 44 },
  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  todayCell: { backgroundColor: '#38A389' },
  selectedCell: { backgroundColor: '#E4F4ED' },
  reflectionCell: { backgroundColor: '#FDECE1', borderWidth: 1, borderColor: '#ED8D41' },
  dayText: { fontSize: 14, fontWeight: '500', color: '#333333' },
  todayDayText: { color: '#FFFFFF', fontWeight: '700' },
  reflectionDayText: { color: '#ED8D41', fontWeight: '700' },
  taskDotRow: { flexDirection: 'row', marginTop: 2 },
  taskDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#38A389' },
  taskDotOnToday: { backgroundColor: '#FFFFFF' },
  reflectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ED8D41', marginTop: 2 },
  selectedDaySection: { marginTop: 4 },
  selectedDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  selectedDayTitle: { fontSize: 16, fontWeight: '700', color: '#222222' },
  progressCounterText: { fontSize: 13, fontWeight: '600', color: '#38A389' },
  emptyTasksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyTasksText: { fontSize: 13, color: '#888888', textAlign: 'center', lineHeight: 18 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  checkTouchable: { marginRight: 12 },
  taskDetails: { flex: 1, marginRight: 12 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: '#222222', marginBottom: 2 },
  completedTitle: { textDecorationLine: 'line-through', color: '#888888' },
  taskDescription: { fontSize: 12, color: '#666666', lineHeight: 16, marginBottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 11, color: '#38A389', marginLeft: 4, fontWeight: '500' },
  markBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E4F4ED',
    borderWidth: 1,
    borderColor: '#38A389',
  },
  markBtnDone: { backgroundColor: '#38A389' },
  markBtnText: { fontSize: 11, fontWeight: '600', color: '#38A389' },
  markBtnTextDone: { color: '#FFFFFF' },
});
