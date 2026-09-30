import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
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

export default function NouvelEvenementScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const user = useAuthStore((s) => s.user);
  const addEvent = useFinanceStore((s) => s.addEvent);

  const [titre, setTitre] = useState('');
  const [date, setDate] = useState('Samedi 26 Septembre 2026');
  const [heure, setHeure] = useState('09h00 - 16h30');
  const [lieu, setLieu] = useState('Grand Temple de la Victoire');
  const [intervenant, setIntervenant] = useState('Pasteur Samuel');
  const [tarif, setTarif] = useState('0');
  const [places, setPlaces] = useState('300');
  const [description, setDescription] = useState('');

  if (!canManageCampaigns(user?.role)) {
    return <Redirect href="/(tabs)/projets" />;
  }

  const handleCreate = async () => {
    if (!titre.trim()) {
      Alert.alert('Titre requis', 'Indiquez le nom de l événement.');
      return;
    }

    try {
      await addEvent({
        titre: titre.trim(),
        description: description.trim() || 'Rassemblement de l Église.',
        date: date.trim() || 'À confirmer',
        heure: heure.trim() || '09h00',
        lieu: lieu.trim() || 'Temple',
        tarif: parseInt(tarif.replace(/\D/g, ''), 10) || 0,
        placesDisponibles: parseInt(places.replace(/\D/g, ''), 10) || 200,
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
        intervenant: intervenant.trim() || 'Pasteur Samuel',
      });
      Alert.alert(
        'Événement programmé',
        'Les fidèles peuvent s inscrire depuis l onglet Événements.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/projets') }]
      );
    } catch (error) {
      Alert.alert('Événement non créé', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  return (
    <KeyboardAwareScreen
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
      header={
        <Header
          title="Nouvel événement"
          subtitle="Séminaire, retraite ou conférence"
          showBack
          variant="curved"
        />
      }
      footer={
        <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
          <Button title="Publier l événement" onPress={handleCreate} size="lg" />
        </View>
      }
    >
      <Card style={styles.card} variant="elevated">
        <Input label="Titre *" placeholder="ex: Séminaire de la Victoire" value={titre} onChangeText={setTitre} />
        <Input label="Date" value={date} onChangeText={setDate} />
        <Input label="Horaires" value={heure} onChangeText={setHeure} />
        <Input label="Lieu" value={lieu} onChangeText={setLieu} />
        <Input label="Intervenant" value={intervenant} onChangeText={setIntervenant} />
        <Input
          label="Tarif (0 = entrée libre)"
          keyboardType="numeric"
          value={tarif}
          onChangeText={setTarif}
        />
        <Input
          label="Places disponibles"
          keyboardType="numeric"
          value={places}
          onChangeText={setPlaces}
        />
        <Input
          label="Description"
          placeholder="Programme, public, consignes…"
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
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
});
