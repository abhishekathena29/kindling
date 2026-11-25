import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { BrainCircuit, Navigation } from 'lucide-react-native';
import { Text } from './Text';

const { height } = Dimensions.get('window');

export interface MilestoneData {
  id: string;
  title: string;
  subtitle: string;
  iconBg: string;
  Icon: any;
  meaning: string;
  actions: string[];
  status: 'completed' | 'in_progress' | 'locked';
  relatedJourney: string;
}

interface MilestoneModalProps {
  milestone: MilestoneData | null;
  visible: boolean;
  onClose: () => void;
  onAskAI: (prompt: string) => void;
  onNavigateToPlan: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ milestone, visible, onClose, onAskAI, onNavigateToPlan }) => {
  const [memory, setMemory] = useState('');
  const [status, setStatus] = useState<'completed' | 'in_progress' | 'locked'>(milestone?.status || 'in_progress');

  if (!milestone) return null;

  const Icon = milestone.Icon;

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
              <View style={[styles.iconContainer, { backgroundColor: milestone.iconBg }]}>
                <Icon size={32} color="#777777" />
              </View>
              <Text style={styles.title}>{milestone.title}</Text>
              <Text style={styles.subtitle}>{milestone.subtitle}</Text>
            </View>

            {/* 2. What this means */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What this means</Text>
              <Text style={styles.bodyText}>{milestone.meaning}</Text>
            </View>

            {/* 3. What you can do */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Try this:</Text>
              {milestone.actions.map((action, idx) => (
                <View key={idx} style={styles.actionRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.actionText}>{action}</Text>
                </View>
              ))}
            </View>

            {/* 4. Memory Capture */}
            <View style={styles.captureSection}>
              <Text style={styles.sectionTitle}>Capture this moment</Text>
              <Text style={styles.captureSubtitle}>What made your child laugh today?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add a memory or note..."
                placeholderTextColor="#AAAAAA"
                value={memory}
                onChangeText={setMemory}
                multiline
              />
            </View>

            {/* 5. Mark Status */}
            <View style={styles.statusSection}>
              <TouchableOpacity 
                style={[styles.statusBtn, status === 'completed' && styles.statusBtnActive]}
                onPress={() => setStatus('completed')}
              >
                <Text style={[styles.statusBtnText, status === 'completed' && { color: '#FFF' }]}>
                  {status === 'completed' ? '✓ Experienced' : 'Mark as Experienced'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusBtnOutline, status === 'in_progress' && styles.statusBtnOutlineActive]}
                onPress={() => setStatus('in_progress')}
              >
                <Text style={styles.statusBtnOutlineText}>Not Yet</Text>
              </TouchableOpacity>
            </View>

            {/* 6. Link to Plan */}
            <TouchableOpacity style={styles.journeyCard} onPress={onNavigateToPlan}>
              <View style={styles.journeyIconBg}>
                <Navigation size={20} color="#38A389" />
              </View>
              <View style={styles.journeyTextCol}>
                <Text style={styles.journeyContextText}>Related to your journey</Text>
                <Text style={styles.journeyTitle}>{milestone.relatedJourney}</Text>
              </View>
            </TouchableOpacity>

            {/* 7. AI Support */}
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => {
                onClose();
                onAskAI(`Give me a practical parenting suggestion and a short sample dialogue for this milestone: ${milestone.title}`);
              }}
            >
              <BrainCircuit size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.aiButtonText}>Ask AI: How to encourage this stage?</Text>
            </TouchableOpacity>
            
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContent: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.85,
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
    marginBottom: 16,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38A389',
    marginTop: 8,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
  },
  captureSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  captureSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 12,
    marginTop: -8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    paddingTop: 16,
    minHeight: 100,
    fontSize: 15,
    color: '#222222',
    textAlignVertical: 'top',
  },
  statusSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statusBtn: {
    flex: 2,
    backgroundColor: '#E4F4ED',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: '#38A389',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38A389',
  },
  statusBtnOutline: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusBtnOutlineActive: {
    borderColor: '#ED8D41',
    backgroundColor: '#FFF5ED',
  },
  statusBtnOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  journeyCard: {
    backgroundColor: '#EFFFF9',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  journeyIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D1F0E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  journeyTextCol: {
    flex: 1,
  },
  journeyContextText: {
    fontSize: 12,
    color: '#528271',
    marginBottom: 4,
  },
  journeyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7E57C2',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
