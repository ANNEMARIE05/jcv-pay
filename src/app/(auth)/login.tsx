'use no memo';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { useAuthStore } from '@/store/authStore';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';

const COMPTES = [
  {
    role: 'ADMINISTRATEUR' as const,
    label: 'Administrateur',
    hint: 'Comptes et caisses',
    icon: 'shield-checkmark' as const,
    tint: '#E8EEF5',
    color: '#1E3A5F',
  },
  {
    role: 'TRESORIER' as const,
    label: 'Trésorier',
    hint: 'Argent reçu',
    icon: 'wallet' as const,
    tint: AppColors.accentLight,
    color: AppColors.accentDark,
  },
  {
    role: 'MEMBRE' as const,
    label: 'Fidèle',
    hint: 'Mes versements',
    icon: 'person' as const,
    tint: AppColors.primaryMuted,
    color: AppColors.primary,
  },
];

export default function LoginScreen() {
  const enterAs = useAuthStore((s) => s.enterAs);

  const openSpace = (role: (typeof COMPTES)[number]['role']) => {
    enterAs(role);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAwareScreen
      style={styles.keyboardContainer}
      contentContainerStyle={styles.scrollContent}
      header={
        <Header
          title="JCV Pay"
          subtitle="Église Jésus Christ Victoire"
          variant="curved"
        />
      }
    >
      <View style={styles.cardContainer}>
        <Card style={styles.formCard}>
          <Text style={styles.loginTitle}>Choisissez un espace</Text>
          <Text style={styles.loginSubtitle}>
            Trois comptes pour parcourir l’application. Pour changer, déconnectez-vous puis choisissez l’autre.
          </Text>

          <View style={styles.roleRow}>
            {COMPTES.map((compte) => (
              <TouchableOpacity
                key={compte.role}
                style={styles.roleCard}
                onPress={() => openSpace(compte.role)}
                activeOpacity={0.85}
              >
                <View style={[styles.roleIcon, { backgroundColor: compte.tint }]}>
                  <Ionicons name={compte.icon} size={22} color={compte.color} />
                </View>
                <Text style={styles.roleName}>{compte.label}</Text>
                <Text style={styles.roleHint}>{compte.hint}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  loginSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginBottom: 18,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleName: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  roleHint: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});
