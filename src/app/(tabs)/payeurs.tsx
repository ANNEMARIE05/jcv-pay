import React from 'react';
import { View, StyleSheet, ScrollView, Redirect } from 'react-native';
import { router } from 'expo-router';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { PayersDirectory } from '@/components/finance/PayersDirectory';
import { useAuthStore } from '@/store/authStore';
import { isStaff } from '@/constants/roles';
import { ListSkeleton } from '@/components/motion/Skeleton';
import { useScreenReady } from '@/hooks/useScreenReady';

export default function PayeursScreen() {
  const user = useAuthStore((s) => s.user);
  const ready = useScreenReady(420);

  if (!isStaff(user?.role)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Payeurs"
        subtitle="Tous les versements, sans exception"
        showBack
        onBack={() => router.replace('/(tabs)')}
        variant="curved"
      />
      {!ready ? (
        <ListSkeleton count={5} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <PayersDirectory />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 130 },
});
