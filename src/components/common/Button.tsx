import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { AppColors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getContainerStyle = () => {
    const base: ViewStyle[] = [styles.button];

    if (fullWidth) base.push(styles.fullWidth);

    switch (size) {
      case 'sm':
        base.push(styles.sizeSm);
        break;
      case 'lg':
        base.push(styles.sizeLg);
        break;
      default:
        base.push(styles.sizeMd);
    }

    switch (variant) {
      case 'secondary':
        base.push(styles.variantSecondary);
        break;
      case 'accent':
        base.push(styles.variantAccent);
        break;
      case 'outline':
        base.push(styles.variantOutline);
        break;
      case 'ghost':
        base.push(styles.variantGhost);
        break;
      case 'danger':
        base.push(styles.variantDanger);
        break;
      default:
        base.push(styles.variantPrimary);
    }

    if (disabled || loading) {
      base.push(styles.disabled);
    }

    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle[] = [styles.text];

    switch (size) {
      case 'sm':
        base.push(styles.textSm);
        break;
      case 'lg':
        base.push(styles.textLg);
        break;
      default:
        base.push(styles.textMd);
    }

    switch (variant) {
      case 'outline':
      case 'ghost':
        base.push(styles.textOutline);
        break;
      case 'secondary':
        base.push(styles.textSecondary);
        break;
      case 'danger':
        base.push(styles.textDanger);
        break;
      default:
        base.push(styles.textPrimary);
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? AppColors.primary : AppColors.white}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  // Sizes
  sizeSm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 26,
  },
  sizeLg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  // Variants
  variantPrimary: {
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  variantSecondary: {
    backgroundColor: AppColors.primaryMuted,
  },
  variantAccent: {
    backgroundColor: AppColors.accent,
    shadowColor: AppColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppColors.primary,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  variantDanger: {
    backgroundColor: AppColors.dangerLight,
  },
  disabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  // Typography
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 16,
  },
  textPrimary: {
    color: AppColors.white,
  },
  textSecondary: {
    color: AppColors.primary,
  },
  textOutline: {
    color: AppColors.primary,
  },
  textDanger: {
    color: AppColors.danger,
  },
});
