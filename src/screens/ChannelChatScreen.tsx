import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { Channel } from '../navigation/ChannelsFlow';
import { useAppContext } from '../context/AppContext';
import { Text } from '../components/Text';

interface ChannelChatScreenProps {
  channel: Channel;
  onBack: () => void;
}

export const ChannelChatScreen: React.FC<ChannelChatScreenProps> = ({ channel, onBack }) => {
  const { setAIFabHidden, channelMessages, loadChannelMessages, sendChannelMessage, authorNames } = useAppContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messages = channelMessages[channel.id] ?? [];

  React.useEffect(() => {
    setAIFabHidden(true);
    return () => setAIFabHidden(false);
  }, [setAIFabHidden]);

  useEffect(() => {
    loadChannelMessages(channel.id);
  }, [channel.id, loadChannelMessages]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setIsSending(true);
    sendChannelMessage(channel.id, trimmed).finally(() => {
      setIsSending(false);
    });
    setMessage('');
  };

  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) {
      return '';
    }
    const parsed = new Date(timestamp).getTime();
    const diff = Date.now() - parsed;
    if (diff < 60000) {
      return 'Just now';
    }
    if (diff < 3600000) {
      const mins = Math.round(diff / 60000);
      return `${mins} min ago`;
    }
    if (diff < 86400000) {
      const hours = Math.round(diff / 3600000);
      return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    }
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvatarColor = (id: string | null | undefined) => {
    const palette = ['#E4F4ED', '#F2E8FD', '#FCE7E4', '#DEF3E6'];
    if (!id) {
      return palette[0];
    }
    const hash = [...id].reduce((acc, digit) => acc + digit.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  const getAuthorDisplay = (messageItem: typeof messages[number]) => {
    const nameFromMetadata = messageItem.metadata?.['displayName'] || messageItem.metadata?.['name'];
    if (typeof nameFromMetadata === 'string' && nameFromMetadata.trim().length > 0) {
      return nameFromMetadata;
    }
    if (messageItem.authorId && authorNames[messageItem.authorId]) {
      return authorNames[messageItem.authorId];
    }
    return messageItem.authorId ?? 'Parent';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#222222" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>{channel.title}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{channel.description}</Text>
        </View>
      </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner at top of chat */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Welcome to <Text style={{fontWeight: '700'}}>{channel.title}</Text>. This is a safe space. Be kind, be supportive.
            </Text>
          </View>

          {/* Messages */}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No one has shared in this channel yet.</Text>
            </View>
          )}
          {messages.map(msg => {
            const author = getAuthorDisplay(msg);
            return (
              <View key={msg.id} style={styles.messageRow}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(msg.authorId) }]}> 
                  <Text style={styles.avatarText}>{author?.charAt(0)}</Text>
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.authorText}>{author}</Text>
                    <Text style={styles.timeText}>{formatRelativeTime(msg.createdAt)}</Text>
                  </View>
                  <Text style={styles.messageText}>{msg.body}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Share your thoughts..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendButton, (isSending || !message.trim()) && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={isSending || !message.trim()}
          >
            <Send size={20} color="#FFF" style={{ marginLeft: -2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888888',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  infoBanner: {
    backgroundColor: '#E4F4ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  infoBannerText: {
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#999999',
  },
  messageText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#888888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    minHeight: 48,
    maxHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  input: {
    fontSize: 15,
    color: '#222222',
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#38A389',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C5E0D8',
  },
});
