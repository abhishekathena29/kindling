import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ArrowLeft, Eye, Lock, Trash2, ShieldCheck, Mail } from 'lucide-react-native';
import { Text } from '../components/Text';

export const PrivacyScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <View style={styles.iconBg}><Eye size={20} color="#38A389" /></View>
          <View style={styles.textCol}>
            <Text style={styles.cardTitle}>Data Collection</Text>
            <Text style={styles.cardDesc}>We only collect quiz responses to personalize your experience. No data is shared with third parties.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.iconBg}><Lock size={20} color="#38A389" /></View>
          <View style={styles.textCol}>
            <Text style={styles.cardTitle}>Data Security</Text>
            <Text style={styles.cardDesc}>Your data is stored locally on your device. We use industry-standard encryption for any cloud syncing.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.iconBg}><Trash2 size={20} color="#38A389" /></View>
          <View style={styles.textCol}>
            <Text style={styles.cardTitle}>Data Deletion</Text>
            <Text style={styles.cardDesc}>You can delete all your data at any time from Settings. This action is irreversible.</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => Linking.openURL('https://www.freeprivacypolicy.com/live/640f99e5-6864-4827-9e08-0fc2b80bcdc0')}
        >
          <View style={styles.iconBg}><ShieldCheck size={20} color="#38A389" /></View>
          <View style={styles.textCol}>
            <Text style={styles.cardTitle}>Full Privacy Policy</Text>
            <Text style={styles.cardDesc}>Tap to read our complete privacy policy documentation on the web.</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Have questions about privacy?</Text>
        <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:mehak.dhawan0206@gmail.com?subject=Kindling%20Privacy%20Inquiry')}>
          <View style={styles.contactBtnIconBg}>
            <Mail size={20} color="#FFFFFF" />
          </View>
          <View style={styles.contactBtnTextCol}>
            <Text style={styles.contactBtnTitle}>Contact Privacy Team</Text>
            <Text style={styles.contactBtnDesc}>Send us an email directly</Text>
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textCol: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222222', marginBottom: 16, marginLeft: 4 },
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
    marginBottom: 40,
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
});
