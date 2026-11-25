import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { ArrowLeft, ChevronDown, ChevronUp, Mail, Search } from 'lucide-react-native';
import { Text } from '../components/Text';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity style={[styles.faqCard, expanded && styles.faqCardActive]} onPress={() => setExpanded(!expanded)}>
      <View style={styles.faqHeader}>
        <Text style={[styles.question, expanded && styles.questionActive]}>{question}</Text>
        {expanded ? <ChevronUp size={20} color="#38A389" /> : <ChevronDown size={20} color="#999" />}
      </View>
      {expanded && <Text style={styles.answer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

const ALL_FAQS = [
  { category: 'Assessment & Plan', question: "What is the Parenting Assessment?", answer: "A 20-question psychological evaluation that maps your warmth and structure patterns so the AI plan can tailor the right support." },
  { category: 'Assessment & Plan', question: "How are my plans personalized?", answer: "Based on your quiz scores, our AI Engine generates daily activities tailored to strengthen areas where you can grow as a parent." },
  { category: 'Assessment & Plan', question: "Can I retake the assessment?", answer: "Yes! Your history is saved, and taking a new assessment allows you to track your growth over time." },
  { category: 'Assessment & Plan', question: "What do the Plan Cards mean?", answer: "Each day you get cards like 'Time to Talk' or 'Let's Read Together'. Tapping them shows a detailed step-by-step guide on how to complete the activity." },
  
  { category: 'Channels & Community', question: "Who can see my messages in Channels?", answer: "Channels are open to all Kindling members who join that specific group. Always remain kind and supportive." },
  { category: 'Channels & Community', question: "Why is the AI Assistant hidden in Channels?", answer: "To preserve genuine human connection in community chats, the AI assistant is disabled while you are actively reading or sending messages in a Channel." },
  
  { category: 'Home & Milestones', question: "How do Milestones work?", answer: "Milestones like 'First Laugh' are beautifully crafted cards to help you document and reflect on major emotional leaps in your child's life." },
  { category: 'Home & Milestones', question: "How is my Streak calculated?", answer: "Your streak goes up when you open Kindling on consecutive days. Miss a day and it resets. Challenge completions update your weekly progress separately." },
  
  { category: 'Account Info', question: "Is my data private?", answer: "Completely. We do not transmit or sell any assessment details, chat logs, or milestone memories." },
  { category: 'Account Info', question: "Can I delete my account?", answer: "Yes, you can permanently delete your account from the new 'Account Settings' page under your Profile tab." },
];

export const HelpSupportScreen = ({ onBack }: { onBack: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return ALL_FAQS;
    const lowerQ = searchQuery.toLowerCase();
    return ALL_FAQS.filter(f => f.question.toLowerCase().includes(lowerQ) || f.answer.toLowerCase().includes(lowerQ));
  }, [searchQuery]);

  const handleContactSupport = () => {
    Linking.openURL('mailto:mehak.dhawan0206@gmail.com?subject=Kindling%20App%20Support');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Need Help?</Text>
          <Text style={styles.bannerDesc}>We're here for you. Browse FAQs or reach out directly.</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for answers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))
        ) : (
          <Text style={styles.noResultsText}>No questions found matching "{searchQuery}".</Text>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Still need help?</Text>
        <TouchableOpacity style={styles.contactBtn} onPress={handleContactSupport}>
          <View style={styles.contactBtnIconBg}>
            <Mail size={20} color="#FFFFFF" />
          </View>
          <View style={styles.contactBtnTextCol}>
            <Text style={styles.contactBtnTitle}>Contact Support</Text>
            <Text style={styles.contactBtnDesc}>We typically reply within 24 hours</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  scrollContent: { padding: 16 },
  banner: {
    backgroundColor: '#E4F4ED',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8 },
  bannerDesc: { fontSize: 14, color: '#555', lineHeight: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 16, marginLeft: 8 },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  faqCardActive: {
    borderColor: '#38A389',
    backgroundColor: '#FAFFFF',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: { fontSize: 14, fontWeight: '600', color: '#222', flex: 1, paddingRight: 16 },
  questionActive: { color: '#38A389' },
  answer: { fontSize: 13, color: '#666', marginTop: 12, lineHeight: 18 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  contactBtnIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#38A389',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactBtnTextCol: { flex: 1 },
  contactBtnTitle: { fontSize: 16, fontWeight: '600', color: '#222222', marginBottom: 4 },
  contactBtnDesc: { fontSize: 13, color: '#777777' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: '#222222' },
  noResultsText: { fontSize: 14, color: '#888888', textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
});
