import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppColors } from '@/constants/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'curved' | 'flat' | 'hero';
  style?: StyleProp<ViewStyle>;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  variant = 'curved',
  style,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios'
    ? Math.max(insets.top, 44)
    : Math.max(insets.top, StatusBar.currentHeight || 24) + 8;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const isCurved = variant === 'curved' || variant === 'hero';

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPadding },
        isCurved && styles.curvedContainer,
        variant === 'hero' && styles.heroContainer,
        style,
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />
      <View style={styles.contentRow}>
        <View style={styles.leftSlot}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Retour"
            >
              <Ionicons name="arrow-back" size={22} color={AppColors.white} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleSlot}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>{rightAction}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  curvedContainer: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingBottom: 18,
  },
  heroContainer: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 28,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightSlot: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
});
