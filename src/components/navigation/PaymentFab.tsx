import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors, Shadows } from '@/constants/colors';

const FAB_SIZE = 52;
const FAB_MARGIN = 16;

export function PaymentFab() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 48) + 10
      : Math.max(insets.bottom, 16) + 8;
  const barHeight = 56 + bottomInset;

  const hideOnRoutes = ['payeurs', 'paiement', 'contribution'];
  if (segments.some((segment) => hideOnRoutes.includes(segment))) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: barHeight + 8 }]}
      onPress={() => router.push('/contribution/nouvelle')}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="Faire un versement"
    >
      <Ionicons name="add" size={28} color={AppColors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: FAB_MARGIN,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    ...Shadows.medium,
    elevation: 12,
  },
});
