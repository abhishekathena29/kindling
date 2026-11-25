import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, BookOpen, HeartHandshake, Award, Target, MessageSquare } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { Text } from './Text';

export const MonthlyReflectionModal: React.FC = () => {
  const { isReflectionModalVisible, setReflectionModalVisible, saveMonthlyReflection } = useAppContext();
  const [feedback, setFeedback] = useState('');
  const [win, setWin] = useState('');
  const [challenge, setChallenge] = useState('');
  const [focusGoal, setFocusGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleSubmit = async () => {
    if (!win.trim() || !challenge.trim() || !focusGoal.trim()) {
      Alert.alert('Reflection Incomplete', 'Please answer the reflection questions so Kindling AI can customize your next week’s plan.');
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
      setIsSubmitting(false);
      setReflectionModalVisible(false);
      // Reset state
      setFeedback('');
      setWin('');
      setChallenge('');
      setFocusGoal('');
      Alert.alert(
        'Reflection Saved & Plan Regenerated ✨',
        `Thank you for your feedback! Kindling AI has regenerated your customized daily tasks for next week based on your feedback and reflection.`,
      );
    } catch (e) {
      console.warn('Unable to save monthly reflection', e);
      setIsSubmitting(false);
      Alert.alert('Error', 'Unable to save reflection. Please try again.');
    }
  };

  return (
    <Modal visible={isReflectionModalVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconBg}>
              <BookOpen size={22} color="#38A389" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Parenting Journal & Reflection</Text>
              <Text style={styles.headerSubtitle}>{currentMonthLabel} • Feedback & Plan Generator</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setReflectionModalVisible(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Weekly/Monthly Check-In & Feedback</Text>
            <Text style={styles.introText}>
              Share feedback on your current tasks and reflect on your progress. Kindling AI will use your input to regenerate your new weekly plan.
            </Text>
          </View>

          {/* Question 0: Feedback on Tasks */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <MessageSquare size={18} color="#38A389" style={{ marginRight: 8 }} />
              <Text style={styles.questionTitle}>1. Task Feedback</Text>
            </View>
            <Text style={styles.questionPrompt}>
              How did this past week's plan work for you? What tasks felt helpful or difficult?
            </Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              placeholder="e.g. The 5-minute listening exercise was great, but the rule negotiation task was hard..."
              placeholderTextColor="#999999"
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          {/* Question 1: Win */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Award size={18} color="#ED8D41" style={{ marginRight: 8 }} />
              <Text style={styles.questionTitle}>2. Parenting Win</Text>
            </View>
            <Text style={styles.questionPrompt}>
              What is one parenting moment or win you felt proud of recently?
            </Text>
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

          {/* Question 2: Challenge */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <HeartHandshake size={18} color="#E54B4B" style={{ marginRight: 8 }} />
              <Text style={styles.questionTitle}>3. Challenge & Conflict</Text>
            </View>
            <Text style={styles.questionPrompt}>
              What conflict or situation felt hardest to navigate with your teen?
            </Text>
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

          {/* Question 3: Focus Goal */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Target size={18} color="#38A389" style={{ marginRight: 8 }} />
              <Text style={styles.questionTitle}>4. Focus Goal for Next Week</Text>
            </View>
            <Text style={styles.questionPrompt}>
              What key habit or boundary do you want to focus on for your next week's plan?
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
              <Text style={styles.submitButtonText}>Regenerate AI Plan for Next Week</Text>
            )}
          </TouchableOpacity>
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
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
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
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
