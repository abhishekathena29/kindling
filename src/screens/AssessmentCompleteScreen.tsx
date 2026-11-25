import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award } from 'lucide-react-native';
import { FinalOutput } from '../engine/scoring';
import { Text } from '../components/Text';

interface AssessmentCompleteScreenProps {
  results: FinalOutput;
  onSeePlan: () => void;
}

export const AssessmentCompleteScreen: React.FC<AssessmentCompleteScreenProps> = ({ results, onSeePlan }) => {
  const confidencePercent = Math.min(100, Math.max(0, Math.round(results.confidence * 100)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Award size={32} color="#38A389" />
        </View>
        <Text style={styles.title}>Quiz Complete</Text>
        <Text style={styles.subtitle}>
          Your answers have been securely stored and will keep shaping your weekly plan.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Confidence snapshot</Text>
        <Text style={styles.cardValue}>{results.confidenceLevel}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${confidencePercent}%` }]} />
        </View>
        <Text style={styles.cardBody}>
          The confidence score (driven by how far apart the top two style scores were) lets us pace your challenges without calling out any style labels directly.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onSeePlan}>
        <Text style={styles.primaryButtonText}>See Your Plan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E4F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38A389',
    borderRadius: 4,
  },
  cardBody: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#38A389',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38A389',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
