import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChannelsListScreen } from '../screens/ChannelsListScreen';
import { ChannelChatScreen } from '../screens/ChannelChatScreen';

export type Channel = {
  id: string;
  title: string;
  description: string;
  category: string;
};

type ChannelsState = 'list' | 'chat';

export const ChannelsFlow = () => {
  const [currentState, setCurrentState] = useState<ChannelsState>('list');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  const handleOpenChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setCurrentState('chat');
  };

  const handleBackToList = () => {
    setCurrentState('list');
    setActiveChannel(null);
  };

  return (
    <View style={styles.container}>
      {currentState === 'list' && (
        <ChannelsListScreen onChannelPress={handleOpenChannel} />
      )}
      {currentState === 'chat' && activeChannel && (
        <ChannelChatScreen channel={activeChannel} onBack={handleBackToList} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
