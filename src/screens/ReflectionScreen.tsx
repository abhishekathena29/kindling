import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, HeartHandshake, Award, Target, MessageSquare, CheckCircle2 } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { Text } from '../components/Text';

export const ReflectionScreen: React.FC = () => {
  const { saveMonthlyReflection, monthlyReflections, weeklyTasks, toggleWeeklyTaskStatus, progressSnapshot } =
    useAppContext();
  const [feedback, setFeedback] = useState('');
  const [win, setWin] = useState('');
  const [challenge, setChallenge] = useState('');
  const [focusGoal, setFocusGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const completedCount = progressSnapshot.completedChallenges;
  const totalCount = Math.max(progressSnapshot.totalChallenges, weeklyTasks.length);

  const handleSubmit = async () => {
    if (!win.trim() || !challenge.trim() || !focusGoal.trim()) {
      Alert.alert(
        'Reflection Incomplete',
        'Please answer the reflection questions so Kindling AI can customize your next week’s plan.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMonthlyReflection({
        feedback: feedback.trim(),
        win: win.trim(),
        challenge: challenge.trim(),
        focusGoal: focusGoal.trim(),
      });
      setFeedback('');
      setWin('');
      setChallenge('');
      setFocusGoal('');
      Alert.alert(
        'New Challenges Ready',
        'Your reflection is saved. Kindling generated fresh weekly challenges based on your feedback.',
      );
    } catch {
      Alert.alert('Error', 'Unable to save reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <View style={styles.iconBg}>
            <BookOpen size={22} color="#38A389" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Weekly Reflection</Text>
            <Text style={styles.headerSubtitle}>{weekLabel} • Shape next week’s challenges</Text>
          </View>
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Complete challenges, then reflect</Text>
          <Text style={styles.introText}>
            Mark this week’s challenges complete below, share what worked, and Kindling will generate a new set of challenges for next week.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>This Week’s Challenges ({completedCount}/{totalCount})</Text>
        {weeklyTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No challenges yet. Finish an assessment to get your first weekly plan.</Text>
          </View>
        ) : (
          weeklyTasks.map(task => {
            const isDone = task.status === 'completed';
            return (
              <View key={task.id} style={styles.challengeCard}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[styles.challengeTitle, isDone && styles.completedText]}>{task.title}</Text>
                  <Text style={styles.challengeDesc}>{task.description}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.completeBtn, isDone && styles.completeBtnDone]}
                  onPress={() => toggleWeeklyTaskStatus(task.id)}
                >
                  {isDone ? <CheckCircle2 size={16} color="#38A389" /> : null}
                  <Text style={[styles.completeBtnText, isDone && styles.completeBtnTextDone]}>
                    {isDone ? 'Completed' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitle}>Reflect & Regenerate</Text>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <MessageSquare size={18} color="#38A389" style={{ marginRight: 8 }} />
            <Text style={styles.questionTitle}>1. Task Feedback</Text>
          </View>
          <Text style={styles.questionPrompt}>
            How did this past week’s plan work for you? What tasks felt helpful or difficult?
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            placeholder="e.g. The listening exercise was great, but the rule negotiation task was hard..."
            placeholderTextColor="#999999"
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Award size={18} color="#ED8D41" style={{ marginRight: 8 }} />
            <Text style={styles.questionTitle}>2. Parenting Win</Text>
          </View>
          <Text style={styles.questionPrompt}>What is one parenting moment or win you felt proud of recently?</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            placeholder="e.g. My teen opened up about school stress without me interrupting..."
            placeholderTextColor="#999999"
            value={win}
            onChangeText={setWin}
          />
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <HeartHandshake size={18} color="#E54B4B" style={{ marginRight: 8 }} />
            <Text style={styles.questionTitle}>3. Challenge & Conflict</Text>
          </View>
          <Text style={styles.questionPrompt}>What conflict or situation felt hardest to navigate with your teen?</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            placeholder="e.g. Managing screen time boundaries after 9 PM..."
            placeholderTextColor="#999999"
            value={challenge}
            onChangeText={setChallenge}
          />
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Target size={18} color="#38A389" style={{ marginRight: 8 }} />
            <Text style={styles.questionTitle}>4. Focus Goal for Next Week</Text>
          </View>
          <Text style={styles.questionPrompt}>
            What key habit or boundary do you want to focus on for your next week’s plan?
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            placeholder="e.g. Practicing active listening before reacting..."
            placeholderTextColor="#999999"
            value={focusGoal}
            onChangeText={setFocusGoal}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Save Reflection & Get New Challenges</Text>
          )}
        </TouchableOpacity>

        {monthlyReflections.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Past Reflections</Text>
            {monthlyReflections.slice(0, 3).map(item => (
              <View key={item.id || item.createdAt} style={styles.historyCard}>
                <Text style={styles.historyPeriod}>{item.periodLabel}</Text>
                <Text style={styles.historySummary} numberOfLines={2}>
                  {item.summary || item.answers.focusGoal}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { padding: 20, paddingBottom: 100 },
  headerBlock: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E4F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#222222' },
  headerSubtitle: { fontSize: 13, color: '#666666', marginTop: 2 },
  introCard: {
    backgroundColor: '#E4F4ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#38A389',
  },
  introTitle: { fontSize: 15, fontWeight: '700', color: '#222222', marginBottom: 4 },
  introText: { fontSize: 13, color: '#555555', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222222', marginBottom: 12, marginTop: 8 },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  emptyText: { fontSize: 13, color: '#666666', lineHeight: 18 },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTitle: { fontSize: 14, fontWeight: '600', color: '#222222', marginBottom: 4 },
  challengeDesc: { fontSize: 12, color: '#666666', lineHeight: 17 },
  completedText: { textDecorationLine: 'line-through', color: '#999999' },
  completeBtn: {
    backgroundColor: '#38A389',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completeBtnDone: { backgroundColor: '#E4F4ED' },
  completeBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  completeBtnTextDone: { color: '#38A389' },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  questionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  questionTitle: { fontSize: 15, fontWeight: '600', color: '#222222' },
  questionPrompt: { fontSize: 13, color: '#666666', marginBottom: 12, lineHeight: 18 },
  textInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#222222',
    textAlignVertical: 'top',
    minHeight: 75,
  },
  submitButton: {
    backgroundColor: '#38A389',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyPeriod: { fontSize: 13, fontWeight: '700', color: '#38A389', marginBottom: 4 },
  historySummary: { fontSize: 13, color: '#555555' },
});
