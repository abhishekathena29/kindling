import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, ClipboardList, MessageCircle, User, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';

export type TabRoutes = 'Home' | 'Assessment' | 'Reflect' | 'Channels' | 'Profile';

interface BottomNavBarProps {
  activeTab: TabRoutes;
  onTabPress: (tab: TabRoutes) => void;
  disabledTabs?: TabRoutes[];
  onDisabledTabPress?: (tab: TabRoutes) => void;
  highlightTabs?: TabRoutes[];
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabPress,
  disabledTabs = [],
  onDisabledTabPress,
  highlightTabs = [],
}) => {
  const insets = useSafeAreaInsets();
  
  const TABS: { name: TabRoutes; icon: React.ElementType }[] = [
    { name: 'Home', icon: Home },
    { name: 'Assessment', icon: ClipboardList },
    { name: 'Reflect', icon: BookOpen },
    { name: 'Channels', icon: MessageCircle },
    { name: 'Profile', icon: User },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 8) }]}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.name;
        const isDisabled = disabledTabs.includes(tab.name);
        const shouldHighlight = isDisabled && highlightTabs.includes(tab.name);
        const color = isDisabled
          ? shouldHighlight
            ? '#FFFFFF'
            : '#CCCCCC'
          : isActive
          ? '#38A389'
          : '#999999';
        const handlePress = () => {
          if (isDisabled) {
            onDisabledTabPress?.(tab.name);
            return;
          }
          onTabPress(tab.name);
        };
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tabButton, shouldHighlight && styles.highlightTab]}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={isDisabled ? 1 : 0.7}
          >
            <Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 2} />
            <Text style={[styles.tabText, { color }]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  highlightTab: {
    backgroundColor: '#38A389',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
