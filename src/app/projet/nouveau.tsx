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
import { Projet } from '@/types';

const CATEGORIES: { id: Projet['categorie']; label: string }[] = [
  { id: 'CONSTRUCTION', label: 'Construction' },
  { id: 'EQUIPEMENT', label: 'Équipement' },
  { id: 'MISSION', label: 'Mission' },
  { id: 'SOCIAL', label: 'Social' },
];

export default function NouveauProjetScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const user = useAuthStore((s) => s.user);
  const addProject = useFinanceStore((s) => s.addProject);

  const [titre, setTitre] = useState('');
  const [objectif, setObjectif] = useState('');
  const [categorie, setCategorie] = useState<Projet['categorie']>('CONSTRUCTION');
  const [organisateur, setOrganisateur] = useState('Conseil Pastoral');
  const [dateFin, setDateFin] = useState('31 Décembre 2026');
  const [description, setDescription] = useState('');

  if (!canManageCampaigns(user?.role)) {
    return <Redirect href="/(tabs)/projets" />;
  }

  const handleCreate = async () => {
    if (!titre.trim() || !objectif.trim()) {
      Alert.alert('Champs requis', 'Indiquez le titre et l objectif en FCFA.');
      return;
    }
    const goalNumber = parseInt(objectif.replace(/\D/g, ''), 10) || 0;
    if (goalNumber <= 0) {
      Alert.alert('Objectif invalide', 'Saisissez un montant supérieur à 0.');
      return;
    }

    try {
      await addProject({
        titre: titre.trim(),
        description: description.trim() || `Collecte pour ${titre.trim()}.`,
        categorie,
        objectif: goalNumber,
        dateFin: dateFin.trim() || '31 Décembre 2026',
        statut: 'EN_COURS',
        imageUrl: 'https://images.unsplash.com/photo-1548625361-1959779df303?auto=format&fit=crop&w=800&q=80',
        organisateur: organisateur.trim() || 'Conseil Pastoral',
        lieu: 'Sanctuaire Principal',
      });
      Alert.alert(
        'Projet publié',
        'Une caisse liée a été ouverte. Les fidèles le voient dans l onglet Projets.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/projets') }]
      );
    } catch (error) {
      Alert.alert('Projet non créé', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  return (
    <KeyboardAwareScreen
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
      header={
        <Header
          title="Nouveau projet"
          subtitle="Visible par tous les fidèles"
          showBack
          variant="curved"
        />
      }
      footer={
        <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
          <Button title="Publier le projet" onPress={handleCreate} size="lg" />
        </View>
      }
    >
      <Card style={styles.card} variant="elevated">
        <Text style={styles.hint}>
          Une caisse de collecte est créée automatiquement avec le même objectif.
        </Text>

        <Input
          label="Titre du projet *"
          placeholder="ex: Extension de la salle polyvalente"
          value={titre}
          onChangeText={setTitre}
        />
        <Input
          label="Objectif financier (FCFA) *"
          placeholder="ex: 10000000"
          keyboardType="numeric"
          value={objectif}
          onChangeText={setObjectif}
        />

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.pillRow}>
          {CATEGORIES.map((cat) => {
            const active = categorie === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setCategorie(cat.id)}
                activeOpacity={0.85}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Organisateur / comité"
          placeholder="Comité des Bâtisseurs"
          value={organisateur}
          onChangeText={setOrganisateur}
        />
        <Input
          label="Date d échéance"
          placeholder="ex: 31 Décembre 2026"
          value={dateFin}
          onChangeText={setDateFin}
        />
        <Input
          label="Description"
          placeholder="Vision, besoin, impact pour l Église…"
          value={description}
          onChangeText={setDescription}
          multiline
        />
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
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: {
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
