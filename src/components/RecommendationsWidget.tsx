import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { PlayCircle, BookOpen, ExternalLink } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { Text } from './Text';

export const RecommendationsWidget = () => {
  const { currentRecommendations } = useAppContext();

  if (!currentRecommendations || currentRecommendations.length === 0) {
    return null;
  }

  const handlePress = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Recommended Resources</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {currentRecommendations.map((resource) => (
          <TouchableOpacity 
            key={resource.id} 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handlePress(resource.url)}
          >
            {resource.type === 'video' ? (
              <View style={styles.thumbnailContainer}>
                {resource.thumbnailUrl ? (
                  <Image source={{ uri: resource.thumbnailUrl }} style={styles.thumbnail} />
                ) : (
                  <View style={[styles.thumbnail, { backgroundColor: '#E4F4ED' }]} />
                )}
                <View style={styles.playOverlay}>
                  <PlayCircle size={32} color="#FFFFFF" strokeWidth={1.5} />
                </View>
              </View>
            ) : (
              <View style={styles.articleIconContainer}>
                <BookOpen size={24} color="#38A389" />
              </View>
            )}

            <View style={styles.textContainer}>
              <View style={styles.tagRow}>
                <Text style={styles.tagText}>
                  {resource.type === 'video' ? 'VIDEO' : 'ARTICLE'}
                </Text>
                {resource.sourceName && (
                  <Text style={styles.sourceText} numberOfLines={1}>• {resource.sourceName}</Text>
                )}
              </View>
              <Text style={styles.titleText} numberOfLines={2}>{resource.title}</Text>
              
              <View style={styles.actionRow}>
                <Text style={styles.actionText}>
                  {resource.type === 'video' ? 'Watch Now' : 'Read Article'}
                </Text>
                <ExternalLink size={14} color="#38A389" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  card: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#EAEAEA',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleIconContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0EC',
  },
  textContainer: {
    padding: 16,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 0.5,
  },
  sourceText: {
    fontSize: 11,
    color: '#999999',
    marginLeft: 4,
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 40,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38A389',
    marginRight: 4,
  },
});
