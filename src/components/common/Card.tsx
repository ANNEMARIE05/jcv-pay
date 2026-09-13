import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { AppColors, Shadows } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat' | 'primary';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  noPadding = false,
}) => {
  const getCardStyle = () => {
    const list: ViewStyle[] = [styles.base];

    if (!noPadding) list.push(styles.padding);

    switch (variant) {
      case 'elevated':
        list.push(styles.elevated);
        break;
      case 'outlined':
        list.push(styles.outlined);
        break;
      case 'flat':
        list.push(styles.flat);
        break;
      case 'primary':
        list.push(styles.primary);
        break;
      default:
        list.push(styles.default);
    }

    return list;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    overflow: 'hidden',
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
