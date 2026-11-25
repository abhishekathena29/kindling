import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, BrainCircuit } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { sendChatMessage, OpenAIMessage } from '../services/openaiService';
import { Text } from './Text';
import { MarkdownText } from './MarkdownText';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  id: string;
}

export const AIAssistantModal = () => {
  const { isAIModalVisible, setAIModalVisible, assessmentHistory, aiDraftMessage, setAIDraftMessage } = useAppContext();
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const typingDots = useRef(new Animated.Value(0)).current;
  // Keeps the full OpenAI-format history for context on every request
  const openAIHistory = useRef<OpenAIMessage[]>([]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: "Hi! I'm your parenting companion. Ask me anything — from handling tough conversations to quick bonding ideas.",
      id: 'welcome',
    },
  ]);

  // Typing indicator animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingDots.setValue(0);
    }
  }, [isTyping, typingDots]);

  useEffect(() => {
    if (!isAIModalVisible) return;
    const draft = aiDraftMessage.trim();
    if (!draft) return;
    setMessage(prev => (prev.trim().length > 0 ? prev : draft));
    setAIDraftMessage('');
  }, [aiDraftMessage, isAIModalVisible, setAIDraftMessage]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: trimmed, id: `u-${Date.now()}` };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const reply = await sendChatMessage(
        openAIHistory.current,
        trimmed,
        styleContext,
        language,
      );
      // Persist both turns into the rolling history
      openAIHistory.current = [
        ...openAIHistory.current,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: reply },
      ];
      const aiMsg: ChatMessage = { role: 'ai', text: reply, id: `ai-${Date.now()}` };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const detail =
        err?.message && typeof err.message === 'string'
          ? err.message
          : "I'm having trouble connecting right now. Please check your internet connection and try again.";
      const errMsg: ChatMessage = {
        role: 'ai',
        text: detail,
        id: `err-${Date.now()}`,
      };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const styleContext = assessmentHistory.length > 0 ? assessmentHistory[0].dominantStyle : null;

  return (
    <Modal
      visible={isAIModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setAIModalVisible(false)}
    >
      <View style={styles.root}>
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBg}>
                <BrainCircuit size={18} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Kindling AI</Text>
                {styleContext && (
                  <Text style={styles.headerSubtitle}>{styleContext} style • Personalised</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setAIModalVisible(false)} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Chat Area */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          >
            {chatHistory.map((chat) => (
              <View
                key={chat.id}
                style={[
                  styles.messageRow,
                  chat.role === 'user' ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                {chat.role === 'ai' && (
                  <View style={styles.aiAvatar}>
                    <BrainCircuit size={14} color="#38A389" />
                  </View>
                )}

                <View style={[
                  styles.bubble,
                  chat.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}>
                  {chat.role === 'ai' && chat.id !== 'welcome' ? (
                    // AI replies are Markdown, already in the user's language (see sendChatMessage).
                    <MarkdownText style={[styles.bubbleText, styles.aiBubbleText]}>
                      {chat.text}
                    </MarkdownText>
                  ) : (
                    <Text style={[
                      styles.bubbleText,
                      chat.role === 'user' ? styles.userBubbleText : styles.aiBubbleText,
                    ]}>
                      {chat.text}
                    </Text>
                  )}
                </View>

                {chat.role === 'user' && (
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>M</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <View style={[styles.messageRow, styles.messageRowLeft]}>
                <View style={styles.aiAvatar}>
                  <BrainCircuit size={14} color="#38A389" />
                </View>
                <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                  <View style={styles.dotsRow}>
                    {[0, 1, 2].map(i => (
                      <Animated.View
                        key={i}
                        style={[
                          styles.dot,
                          {
                            opacity: typingDots,
                            transform: [{ translateY: typingDots.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
                          },
                          { marginLeft: i > 0 ? 4 : 0 },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <SafeAreaView edges={['bottom']} style={styles.inputSafe}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Ask anything..."
                placeholderTextColor="#AAAAAA"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!message.trim()}
                activeOpacity={0.8}
              >
                <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },

  headerSafe: { backgroundColor: '#38A389' },
  header: {
    height: 64,
    backgroundColor: '#38A389',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  chatArea: { flex: 1, backgroundColor: '#F8F9FA' },
  chatContent: { padding: 16, paddingBottom: 24, gap: 12 },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },

  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E4F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#38A389',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  userAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#38A389',
    borderTopRightRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  aiBubbleText: { color: '#222222' },
  userBubbleText: { color: '#FFFFFF' },

  typingBubble: { paddingVertical: 14, paddingHorizontal: 20 },
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38A389',
  },

  inputSafe: { backgroundColor: '#FFFFFF' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: '#222222',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#38A389',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38A389',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#B2D8CC',
    shadowOpacity: 0,
    elevation: 0,
  },
});
