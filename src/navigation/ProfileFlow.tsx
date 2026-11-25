import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { AccountScreen } from '../screens/AccountScreen';
import type { TabRoutes } from '../components/BottomNavBar';

export type ProfileRoutes = 'profile' | 'privacy' | 'help' | 'account';

interface ProfileFlowProps {
  onNavigateTab?: (tab: TabRoutes) => void;
}

export const ProfileFlow: React.FC<ProfileFlowProps> = ({ onNavigateTab }) => {
  const [currentRoute, setCurrentRoute] = useState<ProfileRoutes>('profile');

  const handleNavigate = (route: ProfileRoutes) => {
    setCurrentRoute(route);
  };

  const handleBack = () => {
    setCurrentRoute('profile');
  };

  return (
    <View style={styles.container}>
      {currentRoute === 'profile' && (
        <ProfileScreen onNavigate={handleNavigate} onNavigateTab={onNavigateTab} />
      )}
      {currentRoute === 'privacy' && (
        <PrivacyScreen onBack={handleBack} />
      )}
      {currentRoute === 'help' && (
        <HelpSupportScreen onBack={handleBack} />
      )}
      {currentRoute === 'account' && (
        <AccountScreen onBack={handleBack} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
