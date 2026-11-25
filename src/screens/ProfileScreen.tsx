import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Text } from '../components/Text';

import { Star, Calendar, ArrowUpRight, ChevronRight, User, Lock, HelpCircle, LogOut, BookOpen, Flame } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { Language, useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import type { TabRoutes } from '../components/BottomNavBar';

interface ProfileScreenProps {
  onNavigate: (route: 'privacy' | 'help' | 'account') => void;
  onNavigateTab?: (tab: TabRoutes) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onNavigateTab }) => {
  const { assessmentHistory, progressSnapshot } = useAppContext();
  const { language, setLanguage, languageLabels } = useLanguage();
  const persistLanguagePreference = async (lang: Language) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('profiles')
        .update({ language_preference: lang })
        .eq('id', user.id);
    } catch (error) {
      console.warn('Unable to persist language preference', error);
    }
  };
  const handleLanguageChange = (lang: Language) => {
    if (language === lang) return;
    setLanguage(lang);
    persistLanguagePreference(lang);
  };
  const targetLanguage = language === 'en' ? 'hi' : 'en';
  const [profileName, setProfileName] = useState('Loading...');
  const [profileEmail, setProfileEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single();
        if (error) {
          console.warn('Unable to load profile', error);
        }
          
        if (data) {
          setProfileName(data.name || 'Parent');
          setProfileEmail(data.email || user.email || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    fetchProfile();
  }, []);

  const hasHistory = assessmentHistory.length > 0;
  const latestResult = hasHistory ? assessmentHistory[0] : null;
  const { completedChallenges, totalChallenges, streakDays, weeksActive } = progressSnapshot;
  const weekProgress = totalChallenges > 0
    ? Math.round((completedChallenges / totalChallenges) * 100)
    : 0;

  const handleOpenAssessment = () => {
    if (onNavigateTab) {
      onNavigateTab('Assessment');
      return;
    }
    Alert.alert('Unable to open assessment', 'Assessment navigation is not available from this screen.');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Identity Section */}
        <View style={styles.identitySection}>
          <Image 
            source={require('../assets/logo.png')} 
            style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.userName}>{profileName}</Text>
          <Text style={styles.userEmail}>{profileEmail}</Text>
          <Text style={styles.userSubtitle}>Your parenting journey is in progress</Text>
        </View>

        {Platform.OS === 'ios' ? (
          <View style={styles.languageButton}>
            <View>
              <Text style={styles.settingsText}>App Language</Text>
              <Text style={styles.languageValue}>{languageLabels.en}</Text>
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.languageButton} onPress={() => handleLanguageChange(targetLanguage)}>
              <View>
                <Text style={styles.settingsText}>App Language</Text>
                <Text style={styles.languageValue}>{languageLabels[language]}</Text>
              </View>
              <View style={styles.languageAction}>
                <Text style={styles.languageActionText}>Switch to {languageLabels[targetLanguage]}</Text>
              </View>
            </TouchableOpacity>
            <Text
              style={styles.languageHint}
              value="Translate the entire app to {language} instantly."
              interpolate={{ language: languageLabels[targetLanguage] }}
            />

            <View style={styles.languageControls}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'hi' && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageChange('hi')}
              >
            <Text style={styles.languageOptionLabel}>{languageLabels.hi}</Text>
            <Text style={styles.languageOptionSubtext}>Convert to Hindi</Text>
          </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'en' && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageChange('en')}
              >
            <Text style={styles.languageOptionLabel}>{languageLabels.en}</Text>
            <Text style={styles.languageOptionSubtext}>Switch to English</Text>
          </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.styleCard}>
          <Text style={styles.styleCardTitle}>Latest Assessment</Text>
          {hasHistory && latestResult ? (
            <>
              <Text style={styles.styleName}>Confidence: {latestResult.confidenceLevel}</Text>
              <Text style={styles.assessmentDate}>
                Last assessed: {latestResult.createdAt ? new Date(latestResult.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
              </Text>
              <Text style={styles.styleCardSubtitle}>
                The quiz is securely saved and powers your weekly plan without labelling your parenting style.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.styleName}>No assessment yet</Text>
              <Text style={styles.assessmentDate}>Complete the quiz to personalize your journey.</Text>
            </>
          )}
        </View>

        {/* Progress Dashboard */}
        <View style={styles.dashboardCard}>
          <View style={styles.dashboardHeader}>
            <ArrowUpRight size={20} color="#38A389" />
            <Text style={styles.dashboardTitle}>Progress Dashboard</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <ArrowUpRight size={20} color="#38A389" style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{weekProgress}%</Text>
              <Text style={styles.statLabel}>Week Progress</Text>
            </View>
            <View style={styles.statBox}>
              <Star size={20} color="#38A389" style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>
                {completedChallenges}/{totalChallenges}
              </Text>
              <Text style={styles.statLabel}>Challenges Done</Text>
            </View>
            <View style={styles.statBox}>
              <Flame size={20} color="#38A389" style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{streakDays} days</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Calendar size={20} color="#38A389" style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{weeksActive}</Text>
              <Text style={styles.statLabel}>Weeks Active</Text>
            </View>
          </View>
        </View>

        {/* Assessment History */}
        <Text style={styles.sectionHeader}>Assessment History</Text>
        {hasHistory ? (
          assessmentHistory.map((result, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.historyRow}
              onPress={handleOpenAssessment}
              accessibilityRole="button"
            >
              <View style={styles.historyIconBg}>
                <BookOpen size={20} color="#B67BF3" />
              </View>
              <View style={styles.historyTextCol}>
                <Text style={styles.historyStyle}>Assessment recorded</Text>
                <Text style={styles.historyDate}>
                  {result.createdAt
                    ? new Date(result.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recently'}
                </Text>
                <Text style={styles.historyDesc} numberOfLines={1}>
                  Confidence: {result.confidenceLevel}
                </Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.historyRow}>
            <View style={styles.historyTextCol}>
              <Text style={styles.historyDesc}>No assessments taken yet.</Text>
            </View>
          </View>
        )}

        {/* Growth Timeline (Mock) */}
        {/* Settings Links */}
        <TouchableOpacity style={styles.settingsRow} onPress={() => onNavigate('account')}>
          <User size={20} color="#555" style={{marginRight: 16}} />
          <Text style={styles.settingsText}>Account Settings</Text>
          <ChevronRight size={18} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsRow} onPress={() => onNavigate('privacy')}>
          <Lock size={20} color="#555" style={{marginRight: 16}} />
          <Text style={styles.settingsText}>Privacy Policy</Text>
          <ChevronRight size={18} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsRow} onPress={() => onNavigate('help')}>
          <HelpCircle size={20} color="#555" style={{marginRight: 16}} />
          <Text style={styles.settingsText}>Help & Support</Text>
          <ChevronRight size={18} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsRow} 
          onPress={() => {
            Alert.alert(
              "Log Out",
              "Are you sure you want to log out of Kindling?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Log Out", 
                  style: "destructive",
                  onPress: async () => {
                    await supabase.auth.signOut();
                  }
                }
              ]
            );
          }}
        >
          <LogOut size={20} color="#E74C3C" style={{marginRight: 16}} />
          <Text style={[styles.settingsText, { color: '#E74C3C' }]}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  identitySection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#38A389',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  userSubtitle: {
    fontSize: 13,
    color: '#38A389',
    fontWeight: '500',
  },
  styleCard: {
    backgroundColor: '#F9E5E2',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  styleCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  styleName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  styleCardSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '500',
  },
  assessmentDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  viewFullLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewFullText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38A389',
    marginRight: 4,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  historyIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EBE0F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyTextCol: {
    flex: 1,
  },
  historyStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  historyDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  historyConfidence: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38A389',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  languageValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#38A389',
  },
  languageAction: {
    backgroundColor: '#38A389',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  languageActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  languageHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    marginLeft: 4,
  },
  languageControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  languageOption: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  languageOptionActive: {
    borderColor: '#38A389',
    shadowColor: '#38A389',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  languageOptionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  languageOptionSubtext: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});
