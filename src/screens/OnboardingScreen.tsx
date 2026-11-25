import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconBox } from '../components/IconBox';
import { PaginationDots } from '../components/PaginationDots';
import { Text } from '../components/Text';

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  iconBgColor: string;
  iconColor: string;
  IconComponent: React.ElementType;
  buttonText: string;
}

interface OnboardingScreenProps {
  data: OnboardingStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
}



export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  data,
  currentStep,
  onNext,
  onSkip,
}) => {
  const step = data[currentStep];
  const isLastStep = currentStep === data.length - 1;

  if (!step) return null;

  const { IconComponent } = step;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon & Text Area */}
        <View style={styles.topSection}>
          <IconBox backgroundColor={step.iconBgColor}>
            <IconComponent size={48} color={step.iconColor} strokeWidth={1.5} />
          </IconBox>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        </View>

        {/* Bottom Navigation Area */}
        <View style={styles.bottomSection}>
          <PaginationDots total={data.length} activeIndex={currentStep} />
          
          <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
            <Text style={styles.primaryButtonText}>{step.buttonText}</Text>
          </TouchableOpacity>
          
          {/* Skip button only visible on first 3 steps */}
          <View style={styles.skipContainer}>
            {!isLastStep ? (
              <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.skipButtonPlaceholder} />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Slight off-white background
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#38A389',
    height: 56,
    borderRadius: 28, // Matches pill shape from design
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#38A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: '#888888',
    fontSize: 15,
    fontWeight: '500',
  },
  skipButtonPlaceholder: {
    height: 48,
  },
});
