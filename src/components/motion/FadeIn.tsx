import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface FadeInProps {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  from?: 'down' | 'fade';
}

export function FadeInView({ children, index = 0, delay = 0, style }: FadeInProps) {
  return (
    <Animated.View entering={FadeIn.delay(delay + index * 70).duration(280)} style={style}>
      {children}
    </Animated.View>
  );
}
