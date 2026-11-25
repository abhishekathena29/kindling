import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { QUESTIONS, OPTIONS } from '../engine/scoring';
import { Text } from '../components/Text';

type FlowOption = { label: string; value: string | number };
type FlowQuestionType = 'single' | 'multi' | 'scoring';

interface FlowQuestion {
  id: string;
  text: string;
  type: FlowQuestionType;
  helperText?: string;
  options: FlowOption[];
}

interface QuizScreenProps {
  onBack: () => void;
  onComplete: (answers: Record<string, number>, childInfo: { count: string; ageGroups: string[] }) => void;
}

const metadataQuestions: FlowQuestion[] = [
  {
    id: 'child_count',
    text: 'How many children do you have?',
    type: 'single',
    options: [
      { value: '0', label: '0' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: 'more', label: 'More than 4' },
    ],
  },
  {
    id: 'child_ages',
    text: 'What are your kids’ ages?',
    type: 'multi',
    helperText: 'Select all age groups that apply',
    options: [
      { value: '5-10', label: '5–10 years' },
      { value: '10-13', label: '10–13 years' },
      { value: '13-15', label: '13–15 years' },
      { value: '16-18', label: '16–18 years' },
    ],
  },
];

export const QuizScreen: React.FC<QuizScreenProps> = ({ onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [childCount, setChildCount] = useState('');
  const [selectedAges, setSelectedAges] = useState<string[]>([]);

  const flowQuestions = useMemo<FlowQuestion[]>(() => {
    const scoringQuestions = QUESTIONS.map(q => ({
      id: q.id,
      text: q.text,
      type: 'scoring' as FlowQuestionType,
      options: OPTIONS,
    }));
    return [...metadataQuestions, ...scoringQuestions];
  }, []);

  const currentQuestion = flowQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / flowQuestions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, flowQuestions.length - 1));
  };

  const handleSingleSelect = (value: string) => {
    setChildCount(value);
    goToNext();
  };

  const toggleAgeGroup = (value: string) => {
    setSelectedAges(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value],
    );
  };

  const handleMultiNext = () => {
    if (!selectedAges.length) return;
    goToNext();
  };

  const finishAssessment = (finalAnswers: Record<string, number>) => {
    onComplete(finalAnswers, {
      count: childCount || '0',
      ageGroups: selectedAges,
    });
  };

  const handleScoringSelect = (value: number) => {
    setAnswers(prev => {
      const next = { ...prev, [currentQuestion.id]: value };
      if (currentIndex === flowQuestions.length - 1) {
        finishAssessment(next);
      } else {
        goToNext();
      }
      return next;
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
          <ArrowLeft size={24} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.progressText}>{currentIndex + 1} of {flowQuestions.length}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.categoryText}>WARMTH & STRUCTURE</Text>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>
        <Text style={styles.helperText}>Answer based on your typical behavior with your teen (10-17)</Text>
        {currentQuestion.helperText && (
          <Text style={[styles.helperText, { fontWeight: '600' }]}>{currentQuestion.helperText}</Text>
        )}

        <View style={styles.optionsContainer}>
          {currentQuestion.type === 'multi'
            ? currentQuestion.options.map(opt => {
                const isSelected = selectedAges.includes(opt.value as string);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.multiOption,
                      isSelected && styles.multiOptionSelected,
                    ]}
                    onPress={() => toggleAgeGroup(opt.value as string)}
                  >
                    <Text style={isSelected ? styles.multiOptionTextSelected : styles.optionText}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })
            : currentQuestion.options.map(opt => {
                const isSelected = currentAnswer === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      currentQuestion.type === 'single'
                        ? handleSingleSelect(opt.value as string)
                        : handleScoringSelect(opt.value as number)
                    }
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
        </View>

        {currentQuestion.type === 'multi' && (
          <TouchableOpacity
            style={[
              styles.multiNext,
              !selectedAges.length && styles.multiNextDisabled,
            ]}
            onPress={handleMultiNext}
            disabled={!selectedAges.length}
          >
            <Text style={styles.multiNextText}>Next</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 44, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  progressText: {
    fontSize: 14, fontWeight: '600', color: '#555555',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 24,
    borderRadius: 3,
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38A389',
    borderRadius: 3,
  },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  categoryText: {
    fontSize: 12, fontWeight: '700', color: '#38A389',
    letterSpacing: 1, marginBottom: 8,
  },
  questionText: {
    fontSize: 20, fontWeight: '700', color: '#222222',
    lineHeight: 28, marginBottom: 4,
  },
  helperText: {
    fontSize: 13, color: '#888888', marginBottom: 12,
  },
  optionsContainer: { gap: 8 },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: '#38A389',
    backgroundColor: '#F2FAF8',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16, fontWeight: '500', color: '#222222',
  },
  optionTextSelected: {
    color: '#38A389', fontWeight: '600',
  },
  multiOption: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  multiOptionSelected: {
    backgroundColor: '#38A389',
    borderColor: '#38A389',
  },
  multiOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  multiNext: {
    marginTop: 16,
    backgroundColor: '#38A389',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  multiNextDisabled: {
    backgroundColor: '#9fd2c5',
  },
  multiNextText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
