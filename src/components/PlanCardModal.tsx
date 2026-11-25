import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { BrainCircuit } from 'lucide-react-native';
import { Text } from './Text';

const { height } = Dimensions.get('window');

export interface PlanCardData {
  id: string;
  title: string;
  description: string;
  Icon: any;
  iconBg: string;
  steps: string[];
  status?: 'pending' | 'completed' | 'in_progress';
}

interface PlanCardModalProps {
  plan: PlanCardData | null;
  visible: boolean;
  onClose: () => void;
  onMarkComplete: (id: string) => void;
  onAskAI: (prompt: string) => void;
}

export const PlanCardModal: React.FC<PlanCardModalProps> = ({ plan, visible, onClose, onMarkComplete, onAskAI }) => {
  if (!plan) return null;

  const { Icon } = plan;
  const aiPrompt = [
    `Create a realistic parenting scenario for this weekly challenge and help me practice it.`,
    ``,
    `Challenge title: ${plan.title}`,
    `Goal: ${plan.description}`,
    ``,
    `How to do it (steps):`,
    ...plan.steps.map((step, idx) => `${idx + 1}. ${step}`),
    ``,
    `Please respond with:`,
    `1) A short scenario setup (child age 10–16; assume teen if unsure)`,
    `2) A sample dialogue (parent + child) I can follow`,
    `3) 3 alternative responses if the child reacts defensively`,
    `4) A 1-sentence reminder of the goal`,
  ].join('\n');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.sheetContent}>
          <View style={styles.dragHandle} />
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
            
            {/* 1. Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: plan.iconBg }]}>
                <Icon size={32} color="#777777" />
              </View>
              <Text style={styles.title}>{plan.title}</Text>
              {plan.status && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{plan.status.replace('_', ' ').toUpperCase()}</Text>
                </View>
              )}
              <Text style={styles.description}>{plan.description}</Text>
            </View>

            {/* 2. Steps / Action Plan */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to do this:</Text>
              {plan.steps.map((step, idx) => (
                <View key={idx} style={styles.stepCard}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* 3. Actions */}
            <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.completeBtn, plan.status === 'completed' && styles.completeBtnDisabled]}
              onPress={() => { onMarkComplete(plan.id); onClose(); }}
              disabled={plan.status === 'completed'}
            >
              <Text style={styles.completeBtnText}>
                {plan.status === 'completed' ? 'Already completed' : 'Mark as Completed'}
              </Text>
            </TouchableOpacity>
              
              <TouchableOpacity style={styles.aiButton} onPress={() => { onClose(); onAskAI(aiPrompt); }}>
                <BrainCircuit size={18} color="#7E57C2" style={{ marginRight: 8 }} />
                <Text style={styles.aiButtonText}>Ask AI for a custom scenario</Text>
              </TouchableOpacity>
            </View>
            
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.75,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDDDDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollArea: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E4F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38A389',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
  },
  actionSection: {
    gap: 12,
  },
  completeBtn: {
    backgroundColor: '#38A389',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  completeBtnDisabled: {
    opacity: 0.6,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#F3EFFF',
    borderWidth: 1,
    borderColor: '#E6DCFF',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7E57C2',
  },
  statusBadge: {
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E4F4ED',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38A389',
  },
});
