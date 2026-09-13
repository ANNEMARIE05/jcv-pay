import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppColors } from '@/constants/colors';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'primary'
  | 'neutral'
  | 'accent';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
  size = 'md',
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successContainer;
      case 'warning':
        return styles.warningContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'primary':
        return styles.primaryContainer;
      case 'accent':
        return styles.accentContainer;
      default:
        return styles.neutralContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successText;
      case 'warning':
        return styles.warningText;
      case 'danger':
        return styles.dangerText;
      case 'primary':
        return styles.primaryText;
      case 'accent':
        return styles.accentText;
      default:
        return styles.neutralText;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        getContainerStyle(),
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          getTextStyle(),
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
  successContainer: {
    backgroundColor: AppColors.successLight,
  },
  successText: {
    color: AppColors.success,
  },
  warningContainer: {
    backgroundColor: AppColors.warningLight,
  },
  warningText: {
    color: AppColors.warning,
  },
  dangerContainer: {
    backgroundColor: AppColors.dangerLight,
  },
  dangerText: {
    color: AppColors.danger,
  },
  primaryContainer: {
    backgroundColor: AppColors.primaryMuted,
  },
  primaryText: {
    color: AppColors.primary,
  },
  accentContainer: {
    backgroundColor: AppColors.accentLight,
  },
  accentText: {
    color: AppColors.accent,
  },
  neutralContainer: {
    backgroundColor: '#F1F5F9',
  },
  neutralText: {
    color: AppColors.textSecondary,
  },
});
