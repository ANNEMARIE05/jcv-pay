import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { canManageCampaigns } from '@/constants/roles';

export default function NouvelleCaisseScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const user = useAuthStore((s) => s.user);
  const projets = useFinanceStore((s) => s.projets);
  const openProjectCaisse = useFinanceStore((s) => s.openProjectCaisse);

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [objectif, setObjectif] = useState('');
  const [projetId, setProjetId] = useState<string | undefined>(undefined);

  if (!canManageCampaigns(user?.role)) {
    return <Redirect href="/(tabs)/projets" />;
  }

  const handleCreate = () => {
    if (!nom.trim() || !objectif.trim()) {
      Alert.alert('Champs requis', 'Indiquez le nom et l objectif en FCFA.');
      return;
    }
    const obj = parseInt(objectif.replace(/\D/g, ''), 10) || 0;
    if (obj <= 0) {
      Alert.alert('Objectif invalide', 'Saisissez un montant supérieur à 0.');
      return;
    }

    openProjectCaisse({
      nom: nom.trim(),
      description: description.trim() || 'Nouvelle collecte',
      projetId,
      objectif: obj,
    });

    Alert.alert(
      'Caisse ouverte',
      'Les fidèles la voient dans l onglet Caisses et peuvent y contribuer.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/projets') }]
    );
  };

  return (
    <KeyboardAwareScreen
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
      header={
        <Header
          title="Nouvelle caisse"
          subtitle="Collecte visible aux membres"
          showBack
          variant="curved"
        />
      }
      footer={
        <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
          <Button title="Ouvrir la caisse" onPress={handleCreate} size="lg" />
        </View>
      }
    >
      <Card style={styles.card} variant="elevated">
        <Text style={styles.hint}>
          Ouvrez une caisse autonome, ou rattachez-la à un projet existant.
        </Text>

        <Input
          label="Nom de la caisse *"
          placeholder="ex: Caisse climatisation du temple"
          value={nom}
          onChangeText={setNom}
        />
        <Input
          label="Description"
          placeholder="Pour quoi cette caisse est ouverte"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Input
          label="Objectif (FCFA) *"
          placeholder="ex: 5000000"
          keyboardType="numeric"
          value={objectif}
          onChangeText={setObjectif}
        />

        <Text style={styles.label}>Lier à un projet (optionnel)</Text>
        <View style={styles.pillRow}>
          <TouchableOpacity
            style={[styles.pill, !projetId && styles.pillActive]}
            onPress={() => setProjetId(undefined)}
            activeOpacity={0.85}
          >
            <Text style={[styles.pillText, !projetId && styles.pillTextActive]}>Aucune</Text>
          </TouchableOpacity>
          {projets
            .filter((p) => p.statut !== 'CLOTURE')
            .map((p) => {
              const active = projetId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setProjetId(p.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]} numberOfLines={1}>
                    {p.titre}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      </Card>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  card: { padding: 16, borderRadius: 20 },
  hint: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  pill: {
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: AppColors.primaryMuted,
  },
  pillActive: { backgroundColor: AppColors.primary },
  pillText: { fontSize: 12, fontWeight: '700', color: AppColors.primary },
  pillTextActive: { color: AppColors.white },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
});
