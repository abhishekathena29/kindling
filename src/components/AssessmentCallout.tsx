import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { ArrowDown } from 'lucide-react-native';
import { Text } from './Text';

export const AssessmentCallout = () => {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -6, duration: 500, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [bounce]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.arrowWrapper, { transform: [{ translateY: bounce }] }]}>
        <ArrowDown size={32} color="#FFFFFF" />
      </Animated.View>
      <TouchableOpacity activeOpacity={1} style={styles.button}>
        <Text style={styles.message}>Complete the assessment — unlocking insights</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 88,
    alignItems: 'center',
  },
  arrowWrapper: {
    padding: 4,
    borderRadius: 24,
    backgroundColor: '#38A389',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
