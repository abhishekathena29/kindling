import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { BrainCircuit } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';

export const AIAssistantFAB = () => {
  const insets = useSafeAreaInsets();
  const { setAIModalVisible, isAIFabHidden } = useAppContext();

  if (isAIFabHidden) return null;

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        { bottom: insets.bottom + 80 } // Above the bottom nav bar
      ]}
      activeOpacity={0.8}
      onPress={() => setAIModalVisible(true)}
    >
      <BrainCircuit size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#38A389',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 999,
  },
});
