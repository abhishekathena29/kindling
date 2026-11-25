import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, View, StyleSheet } from 'react-native';
import { AssessmentLandingScreen } from '../screens/AssessmentLandingScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { AssessmentCompleteScreen } from '../screens/AssessmentCompleteScreen';
import { PersonalizedPlanScreen } from '../screens/PersonalizedPlanScreen';
import { calculateScores, FinalOutput } from '../engine/scoring';
import { useAppContext } from '../context/AppContext';
import { generateAIPlan } from '../services/aiPlanService';
import { Text } from '../components/Text';
import { ChildInfo } from '../types/childInfo';

type AssessmentState = 'landing' | 'quiz' | 'results' | 'plan' | 'generating';

export const AssessmentFlow = () => {
  const { assessmentHistory, addAssessmentResult } = useAppContext();
  // Start directly on the plan when an assessment exists, so the landing
  // screen doesn't flash for a frame when switching to this tab.
  const [currentState, setCurrentState] = useState<AssessmentState>(() =>
    assessmentHistory.length > 0 ? 'plan' : 'landing',
  );
  const [currentResults, setCurrentResults] = useState<FinalOutput | null>(
    () => assessmentHistory[0] ?? null,
  );

  useEffect(() => {
    // If we land on the assessment tab and there is a history, show the plan immediately
    if (assessmentHistory.length > 0 && currentState === 'landing') {
      setCurrentResults(assessmentHistory[0]);
      setCurrentState('plan');
    }
  }, [assessmentHistory, currentState]);

  const handleCompleteQuiz = async (answers: Record<string, number>, childInfo: ChildInfo) => {
    setCurrentState('generating');
    const output = calculateScores(answers);
    try {
      const planPayload = await generateAIPlan(answers, output, childInfo);
      const enriched = { ...output, aiPlan: planPayload.plan, childInfo };
      await addAssessmentResult(enriched, planPayload);
      setCurrentResults(enriched);
    } catch (error) {
      console.error('Plan generation failed', error);
      const detail =
        error instanceof Error
          ? error.message
          : 'We could not reach the AI service right now.';
      Alert.alert(
        'Plan generation failed',
        `${detail}\n\nYour assessment is saved, and you can view the static plan.`,
      );
      const fallback = { ...output, childInfo };
      await addAssessmentResult(fallback);
      setCurrentResults(fallback);
    } finally {
      setCurrentState('results');
    }
  };

  return (
    <View style={styles.container}>
      {currentState === 'landing' && (
        <AssessmentLandingScreen onStartAssessment={() => setCurrentState('quiz')} />
      )}
      {currentState === 'quiz' && (
        <QuizScreen
          onBack={() => {
            // If they have history, go back to plan instead of landing
            if (assessmentHistory.length > 0) {
              setCurrentState('plan');
            } else {
              setCurrentState('landing');
            }
          }}
          onComplete={handleCompleteQuiz}
        />
      )}
      {currentState === 'results' && currentResults && (
        <AssessmentCompleteScreen
          results={currentResults}
          onSeePlan={() => setCurrentState('plan')}
        />
      )}
      {currentState === 'generating' && (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color="#38A389" />
          <Text style={styles.generatingText}>Creating your weekly plan…</Text>
        </View>
      )}
      {currentState === 'plan' && currentResults && (
        <PersonalizedPlanScreen
          results={currentResults}
          onRetake={() => setCurrentState('quiz')}
          onViewResults={() => setCurrentState('results')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FAFAFA',
  },
  generatingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#444444',
    textAlign: 'center',
  },
});
