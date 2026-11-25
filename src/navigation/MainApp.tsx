import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { BottomNavBar, TabRoutes } from '../components/BottomNavBar';
import { AIAssistantFAB } from '../components/AIAssistantFAB';
import { AIAssistantModal } from '../components/AIAssistantModal';
import { AssessmentFlow } from './AssessmentFlow';
import { ChannelsFlow } from './ChannelsFlow';
import { ProfileFlow } from './ProfileFlow';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OfflineNotice } from '../components/OfflineNotice';
import { AssessmentCallout } from '../components/AssessmentCallout';
import { MonthlyReflectionModal } from '../components/MonthlyReflectionModal';
import { CalendarView } from '../components/CalendarView';
import { ReflectionScreen } from '../screens/ReflectionScreen';
import { useAppContext } from '../context/AppContext';

export const MainApp = () => {
  const [activeTab, setActiveTab] = useState<TabRoutes>('Home');
  const { hasCompletedAssessment, isAssessmentHistoryLoaded } = useAppContext();
  // Don't gate tabs (or flash the "start assessment" screen) until we know.
  const requiresAssessment = isAssessmentHistoryLoaded && !hasCompletedAssessment;

  useEffect(() => {
    if (requiresAssessment && activeTab !== 'Assessment') {
      setActiveTab('Assessment');
    }
  }, [requiresAssessment, activeTab]);

  const handleDisabledTabPress = (_tab: TabRoutes) => {
    Alert.alert('Complete the assessment first', 'Take the quiz to unlock the rest of Kindling.');
  };

  const handleNavigate = (tab: TabRoutes) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <OfflineNotice />
      {/* Screen Content */}
      <View style={styles.content}>
        {!isAssessmentHistoryLoaded && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#38A389" />
          </View>
        )}
        {isAssessmentHistoryLoaded && activeTab === 'Home' && <HomeScreen onNavigate={(tab) => handleNavigate(tab as TabRoutes)} />}
        {isAssessmentHistoryLoaded && activeTab === 'Assessment' && <AssessmentFlow />}
        {isAssessmentHistoryLoaded && activeTab === 'Reflect' && <ReflectionScreen />}
        {isAssessmentHistoryLoaded && activeTab === 'Channels' && <ChannelsFlow />}
        {isAssessmentHistoryLoaded && activeTab === 'Profile' && <ProfileFlow onNavigateTab={handleNavigate} />}
      </View>

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabPress={handleNavigate}
        disabledTabs={requiresAssessment ? ['Home', 'Reflect', 'Channels', 'Profile'] : []}
        onDisabledTabPress={handleDisabledTabPress}
        highlightTabs={requiresAssessment ? ['Assessment'] : []}
      />

      {requiresAssessment && <AssessmentCallout />}

      {/* Modals — rendered outside content to avoid z-index issues */}
      <NotificationsScreen />
      <AIAssistantModal />
      <MonthlyReflectionModal />
      <CalendarView />

      {/* FAB — rendered last so it sits on top of everything */}
      <AIAssistantFAB />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
