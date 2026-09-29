import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppColors } from '@/constants/colors';

interface BoneProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Bone({ width = '100%', height = 14, radius = 8, style }: BoneProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bone,
        { width, height, borderRadius: radius },
        pulse,
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  withAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({ lines = 3, withAvatar = true, style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        {withAvatar ? <Bone width={44} height={44} radius={14} /> : null}
        <View style={styles.col}>
          <Bone width="72%" height={14} />
          <Bone width="48%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      {Array.from({ length: lines }).map((_, i) => (
        <Bone
          key={i}
          width={i === lines - 1 ? '55%' : '100%'}
          height={10}
          style={{ marginTop: i === 0 ? 16 : 8 }}
        />
      ))}
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.homeWrap}>
      <View style={styles.hero}>
        <Bone width={160} height={16} radius={8} style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
        <Bone width="80%" height={22} radius={8} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.35)' }} />
        <Bone width="60%" height={12} radius={8} style={{ marginTop: 10, backgroundColor: 'rgba(255,255,255,0.22)' }} />
      </View>
      <View style={styles.homeCard}>
        <Bone width="100%" height={36} radius={12} />
        <Bone width="50%" height={12} style={{ marginTop: 18 }} />
        <Bone width="70%" height={28} style={{ marginTop: 10 }} />
        <View style={styles.amtRow}>
          <Bone width="22%" height={36} radius={12} />
          <Bone width="22%" height={36} radius={12} />
          <Bone width="22%" height={36} radius={12} />
          <Bone width="22%" height={36} radius={12} />
        </View>
        <Bone width="100%" height={52} radius={26} style={{ marginTop: 16 }} />
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Bone width="40%" height={16} />
        <SkeletonCard style={{ marginTop: 12 }} />
        <SkeletonCard style={{ marginTop: 10 }} lines={1} />
        <SkeletonCard style={{ marginTop: 10 }} lines={1} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.listWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={i % 2 === 0 ? 3 : 2} />
      ))}
    </View>
  );
}

export function TicketSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.ticket}>
          <View style={styles.row}>
            <Bone width={36} height={36} radius={18} />
            <View style={styles.col}>
              <Bone width="65%" height={13} />
              <Bone width="40%" height={11} style={{ marginTop: 8 }} />
            </View>
          </View>
          <Bone width="100%" height={1} radius={0} style={{ marginVertical: 16 }} />
          <Bone width="80%" height={16} />
          <Bone width="45%" height={22} style={{ marginTop: 16 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: '#D9E3E8',
  },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  homeWrap: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  hero: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  homeCard: {
    marginHorizontal: 20,
    marginTop: -36,
    backgroundColor: AppColors.card,
    borderRadius: 24,
    padding: 20,
  },
  amtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  listWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
    paddingBottom: 40,
  },
  ticket: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
});
