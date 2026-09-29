import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppColors } from '@/constants/colors';

interface BrandedLoaderProps {
  title?: string;
  subtitle?: string;
  hint?: string;
  compact?: boolean;
}

export function BrandedLoader({
  title = 'Chargement…',
  subtitle,
  hint,
  compact = false,
}: BrandedLoaderProps) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0.88);

  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 1100, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse, spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.spinnerBox}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.core, coreStyle]} />
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function FullScreenLoader(props: BrandedLoaderProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <BrandedLoader {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  wrapCompact: {
    paddingVertical: 8,
  },
  spinnerBox: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3.5,
    borderColor: AppColors.primaryMuted,
    borderTopColor: AppColors.primary,
    borderRightColor: AppColors.accent,
  },
  core: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.accent,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  hint: {
    fontSize: 11,
    color: AppColors.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 53, 52, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 28,
    width: '82%',
    maxWidth: 340,
  },
});
