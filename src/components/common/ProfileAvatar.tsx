import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';

interface ProfileAvatarProps {
  uri?: string | null;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
  accentIcon?: keyof typeof Ionicons.glyphMap;
}

export function ProfileAvatar({
  uri,
  size = 84,
  iconSize,
  style,
  accentIcon = 'person',
}: ProfileAvatarProps) {
  const radius = size / 2;
  const resolvedIconSize = iconSize ?? Math.round(size * 0.45);

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : (
        <Ionicons name={accentIcon} size={resolvedIconSize} color={AppColors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
