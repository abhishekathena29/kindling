import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList, Target, Brain, Lightbulb, X, PlayCircle } from 'lucide-react-native';
import { RecommendationsWidget } from '../components/RecommendationsWidget';
import { Text } from '../components/Text';

interface AssessmentLandingScreenProps {
  onStartAssessment: () => void;
}

export const AssessmentLandingScreen: React.FC<AssessmentLandingScreenProps> = ({ onStartAssessment }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Assessment</Text>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBg}>
            <ClipboardList size={24} color="#B683F2" />
          </View>
        <Text style={styles.heroTitle}>Discover how you show up as a parent</Text>
        <Text style={styles.heroSubtitle}>
          20 quick questions centered on warmth and structure to unlock a personalized plan with weekly challenges, AI insights, and growth tracking.
        </Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={onStartAssessment}>
            <Text style={styles.primaryButtonText}>Start Assessment →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowInfoModal(true)}>
            <Text style={styles.secondaryButtonText}>Learn how it works</Text>
          </TouchableOpacity>
        </View>

        {/* Why Take the Assessment? */}
        <Text style={styles.sectionTitle}>Why Take the Assessment?</Text>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIconBg, { backgroundColor: '#FAE7D8' }]}>
            <Target size={20} color="#666666" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Personalized Plan</Text>
            <Text style={styles.featureSubtitle}>Get a roadmap tailored to your unique parenting style</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIconBg, { backgroundColor: '#EBE0F9' }]}>
            <Brain size={20} color="#666666" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>AI-Powered Insights</Text>
            <Text style={styles.featureSubtitle}>Understand your strengths and growth areas</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIconBg, { backgroundColor: '#D3EFE4' }]}>
            <Lightbulb size={20} color="#666666" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Weekly Challenges</Text>
            <Text style={styles.featureSubtitle}>Actionable tasks to strengthen your bond</Text>
          </View>
        </View>

        {/* Recommended Resources */}
        <RecommendationsWidget />
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowInfoModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <PlayCircle size={20} color="#222222" />
                  <Text style={styles.modalHeaderTitle}>How It Works</Text>
                </View>
                <TouchableOpacity onPress={() => setShowInfoModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X size={20} color="#666666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Our parenting assessment is built on established psychological frameworks measuring Warmth and Structure.
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{fontWeight: '700'}}>1. Take the Quiz:</Text> Answer 20 real-world scenario questions about your parenting reactions.
                </Text>
                <Text style={styles.modalText}>
              <Text style={{fontWeight: '700'}}>2. Understand your balance:</Text> See how your warmth and structure tendencies shape the plan.
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{fontWeight: '700'}}>3. Receive a Plan:</Text> Based on your scores, our AI Engine generates a customized weekly plan to help you grow.
                </Text>
              </View>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowInfoModal(false)}>
                <Text style={styles.modalCloseBtnText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { padding: 24, paddingBottom: 100 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#222222', marginBottom: 24 },
  heroCard: { backgroundColor: '#E7ECF7', borderRadius: 24, padding: 24, marginBottom: 32 },
  heroIconBg: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#222222', marginBottom: 12 },
  heroSubtitle: { fontSize: 14, color: '#555555', lineHeight: 22, marginBottom: 24 },
  primaryButton: { backgroundColor: '#38A389', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { height: 40, justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: '#38A389', fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#222222', marginBottom: 20 },
  featureItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureIconBg: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#222222', marginBottom: 4 },
  featureSubtitle: { fontSize: 13, color: '#666666', lineHeight: 20 },
  resourceCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  resourceIconBg: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  resourceTextContainer: { flex: 1 },
  resourceTag: { fontSize: 10, fontWeight: '700', color: '#888888', marginBottom: 4 },
  resourceTitle: { fontSize: 16, fontWeight: '600', color: '#222222', marginBottom: 6 },
  resourceSubtitle: { fontSize: 13, color: '#666666', lineHeight: 20, marginBottom: 8 },
  resourceMeta: { fontSize: 12, fontWeight: '500', color: '#38A389' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#FAFAFA', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#222222' },
  modalBody: { padding: 20, paddingBottom: 8 },
  modalText: { fontSize: 15, color: '#555555', lineHeight: 24, marginBottom: 16 },
  modalCloseBtn: { backgroundColor: '#38A389', paddingVertical: 14, borderRadius: 16, alignItems: 'center', margin: 20, marginTop: 4 },
  modalCloseBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
