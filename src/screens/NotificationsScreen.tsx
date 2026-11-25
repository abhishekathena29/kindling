import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Bell, X } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { Text } from '../components/Text';

export const NotificationsScreen = () => {
  const { showNotifications, setShowNotifications, notifications, markNotificationRead } = useAppContext();

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const formatDate = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Modal
      visible={showNotifications}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowNotifications(false)}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => setShowNotifications(false)}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Bell size={20} color="#222222" />
                <Text style={styles.headerTitle}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color="#666666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {sortedNotifications.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>You're all caught up.</Text>
                </View>
              )}
              {sortedNotifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notificationCard, !notif.read && styles.unreadCard]}
                  activeOpacity={0.8}
                  onPress={() => markNotificationRead(notif.id)}
                >
                  <View style={styles.borderLeft} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{notif.title}</Text>
                    <Text style={styles.cardMessage}>{notif.body}</Text>
                    <Text style={styles.cardDate}>{formatDate(notif.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  scrollContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  unreadCard: {
    borderColor: '#38A389',
    borderWidth: 1,
  },
  borderLeft: {
    width: 4,
    backgroundColor: '#38A389',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#777777',
  },
});
