import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppColors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1 or 0 to 100
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showPercentage = false,
  color = AppColors.primary,
  backgroundColor = '#E2E8F0',
  style,
}) => {
  const normalized = Math.min(Math.max(progress > 1 ? progress : progress * 100, 0), 100);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(normalized, {
      duration: 780,
      easing: Easing.out(Easing.cubic),
    });
  }, [normalized, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.track, { height, backgroundColor, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              borderRadius: height / 2,
            },
            fillStyle,
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentageText}>{Math.round(normalized)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
    marginTop: 4,
    textAlign: 'right',
  },
});
