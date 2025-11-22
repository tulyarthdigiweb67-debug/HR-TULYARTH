import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export function SkeletonBlock({ style }) {
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return <Animated.View style={[styles.skeletonBlock, style, { opacity }]} />;
}

export function SkeletonCircle({ size, style }) {
  return <SkeletonBlock style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
}

const styles = StyleSheet.create({
  skeletonBlock: {
    backgroundColor: '#E5E7EB',
  },
});

export default SkeletonBlock;



