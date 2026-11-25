import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, ChevronRight, RotateCcw } from 'lucide-react-native';
import { Channel } from '../navigation/ChannelsFlow';
import { Text } from '../components/Text';
import { useAppContext } from '../context/AppContext';

type ChannelRecord = ReturnType<typeof useAppContext>['channels'][number];

interface ChannelsListScreenProps {
  onChannelPress: (channel: Channel) => void;
}

export const ChannelsListScreen: React.FC<ChannelsListScreenProps> = ({ onChannelPress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { channels, refreshChannels, isOnline } = useAppContext();

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredChannels = normalizedSearch
    ? channels.filter(channel => channel.name.toLowerCase().includes(normalizedSearch))
    : channels;

  const recommendedChannels = filteredChannels.slice(0, 3);

  const groupedChannels = filteredChannels.reduce<Record<string, ChannelRecord[]>>((acc, channel) => {
    const key = channel.category || 'General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(channel);
    return acc;
  }, {});

  const categories = Object.keys(groupedChannels).sort();

  const toChannel = (record: ChannelRecord): Channel => ({
    id: record.id,
    title: record.name,
    description: record.description,
    category: record.category,
  });

  const renderChannelRow = (channelRecord: ChannelRecord) => (
    <TouchableOpacity
      key={channelRecord.id}
      style={styles.channelRow}
      onPress={() => onChannelPress(toChannel(channelRecord))}
    >
      <View style={styles.channelLetterBadge}>
        <Text style={styles.channelLetter}>{channelRecord.name.charAt(0)}</Text>
      </View>
      <View style={styles.channelTextCol}>
        <Text style={styles.channelTitle}>{channelRecord.name}</Text>
        <Text style={styles.channelDesc} numberOfLines={1}>{channelRecord.description}</Text>
      </View>
      <ChevronRight size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}> 
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Channels</Text>
            <Text style={styles.headerSubtitle}>Learn, share, and connect with other parents</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.refreshButton,
              (!isOnline || isRefreshing) && styles.refreshButtonDisabled,
            ]}
            onPress={() => {
              if (!isOnline || isRefreshing) {
                return;
              }
              setIsRefreshing(true);
              refreshChannels().finally(() => setIsRefreshing(false));
            }}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#38A389" />
            ) : (
              <RotateCcw size={20} color="#38A389" />
            )}
            <Text style={styles.refreshLabel}>{isRefreshing ? 'Refreshing' : 'Refresh'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search channels..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {recommendedChannels.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>RECOMMENDED FOR YOU</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedScroll}>
              {recommendedChannels.map(channel => (
                <TouchableOpacity
                  key={channel.id}
                  style={styles.recommendedCard}
                  onPress={() => onChannelPress(toChannel(channel))}
                >
                  <View style={styles.recBadge}>
                    <Text style={styles.recBadgeText}>{channel.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.recTextCol}>
                    <Text style={styles.recTitle} numberOfLines={2}>{channel.name}</Text>
                    <Text style={styles.recSubtitle} numberOfLines={2}>{channel.description}</Text>
                  </View>
                  <ChevronRight size={16} color="#999" style={styles.recIndicator} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {channels.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No channels yet. Once you join one it will appear here.</Text>
          </View>
        )}

        {categories.map(category => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.sectionHeader}>{category}</Text>
            {groupedChannels[category].map(renderChannelRow)}
          </View>
        ))}
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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  headerTitleCol: {
    flex: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38A389',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  refreshButtonDisabled: {
    borderColor: '#C5E0D8',
  },
  refreshLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38A389',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    marginBottom: 12,
    marginTop: 16,
  },
  recommendedScroll: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  recommendedCard: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    paddingBottom: 26,
    marginRight: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    position: 'relative',
  },
  recBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F2E8FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  recTextCol: {
    marginTop: 8,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  recSubtitle: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  recIndicator: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  emptyText: {
    fontSize: 13,
    color: '#777777',
  },
  categorySection: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  channelLetterBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#DEF3E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  channelTextCol: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  channelDesc: {
    fontSize: 13,
    color: '#666666',
  },
});
