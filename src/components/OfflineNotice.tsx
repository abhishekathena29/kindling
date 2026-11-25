import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useAppContext } from '../context/AppContext';

export const OfflineNotice = () => {
  const { isOnline, connectivityMessage } = useAppContext();

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text} numberOfLines={2}>
        {connectivityMessage ?? 'Internet connection required to sync the latest data. Please reconnect.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F9735E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
