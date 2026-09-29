import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppColors, Shadows } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat' | 'primary';
  noPadding?: boolean;
  enterIndex?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  noPadding = false,
}) => {
  const cardStyle = [
    styles.base,
    !noPadding && styles.padding,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    variant === 'primary' && styles.primary,
    variant === 'default' && styles.default,
    style,
  ];

  if (onPress) {
    return (
      <Pressable style={cardStyle} onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
  },
  padding: {
    padding: 16,
  },
  default: {
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.card,
  },
  elevated: {
    backgroundColor: AppColors.card,
    ...Shadows.medium,
  },
  outlined: {
    backgroundColor: AppColors.card,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  flat: {
    backgroundColor: '#F8FAFC',
  },
  primary: {
    backgroundColor: AppColors.primary,
  },
});
